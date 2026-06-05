import { Injectable, Logger } from '@nestjs/common';

export interface OllamaAnalysisResult {
  isSpam: boolean;
  isSensitive: boolean;
  isValid: boolean;
  confidence: number; // 0 - 100
  reason: string;
  category: 'SPAM' | 'SENSITIVE' | 'INAPPROPRIATE' | 'VALID' | 'UNCLEAR';
  suggestedAction: 'APPROVE' | 'REJECT' | 'REVIEW';
}

@Injectable()
export class OllamaService {
  private readonly logger = new Logger(OllamaService.name);
  private readonly baseUrl =
    process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  private readonly model = process.env.OLLAMA_MODEL || 'gemma4';

  /**
   * Phân tích nội dung phản ánh bằng AI (Ollama)
   * Phát hiện spam, nội dung nhạy cảm, thông tin không hợp lệ
   */
  async analyzeReflection(
    title: string,
    content: string,
    description?: string,
  ): Promise<OllamaAnalysisResult> {
    const text = [title, content, description].filter(Boolean).join(' | ');
    const startTime = Date.now();

    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content:
                'You are a Vietnamese flood-report content moderator. Analyze the report and reply with ONLY valid JSON, no markdown, no explanation.',
            },
            {
              role: 'user',
              content: `Report: "${text}"

Rules:
- SPAM: meaningless, random chars, ads, unrelated to flood/disaster
- SENSITIVE: personal ID/phone numbers, political content
- INAPPROPRIATE: vulgar, offensive language
- VALID: legitimate flood/disaster/infrastructure report

Reply ONLY this JSON:
{"isSpam":false,"isSensitive":false,"isValid":true,"confidence":95,"reason":"...","category":"VALID","suggestedAction":"APPROVE"}`,
            },
          ],
          stream: false,
          options: {
            temperature: 0.1,
            num_predict: 512, // Tăng lên để an toàn
            num_ctx: 2048,
            top_k: 10,
            top_p: 0.9,
          },
        }),
        signal: AbortSignal.timeout(120_000), // 120 giây
      });

      if (!response.ok) {
        if (response.status === 404) {
          this.logger.warn(
            `Model "${this.model}" chưa được pull. Chạy lệnh: ollama pull ${this.model}`,
          );
        } else {
          this.logger.warn(
            `Ollama API lỗi HTTP ${response.status}, bỏ qua kiểm duyệt`,
          );
        }
        return this.fallbackResult();
      }

      const data = (await response.json()) as any;
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

      // API chat trả kết quả trong data.message.content
      const aiResponse = data?.message?.content || '';

      this.logger.log(
        `Ollama phân tích xong trong ${elapsed}s. Raw: ${JSON.stringify(aiResponse)}`,
      );

      return this.parseResponse(aiResponse);
    } catch (err) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      this.logger.warn(
        `Ollama timeout/lỗi sau ${elapsed}s: ${(err as Error).message}. Bỏ qua kiểm duyệt.`,
      );
      return this.fallbackResult();
    }
  }

  // ─── Private helpers ─────────────────────────────────────────────────────────

  private parseResponse(raw: string): OllamaAnalysisResult {
    try {
      // Trích xuất JSON từ response (AI có thể trả về thêm text ngoài JSON)
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Không tìm thấy JSON trong response');

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        isSpam: Boolean(parsed.isSpam),
        isSensitive: Boolean(parsed.isSensitive),
        isValid: Boolean(parsed.isValid),
        confidence: Number(parsed.confidence) || 50,
        reason: String(parsed.reason || 'Không có lý do'),
        category: parsed.category || 'UNCLEAR',
        suggestedAction: parsed.suggestedAction || 'REVIEW',
      };
    } catch {
      this.logger.warn(`Không parse được response AI: "${raw.slice(0, 200)}"`);
      return this.fallbackResult();
    }
  }

  /** Kết quả mặc định khi Ollama không khả dụng – KHÔNG chặn người dùng */
  private fallbackResult(): OllamaAnalysisResult {
    return {
      isSpam: false,
      isSensitive: false,
      isValid: true,
      confidence: 0,
      reason: 'Hệ thống kiểm duyệt AI tạm thời không khả dụng.',
      category: 'UNCLEAR',
      suggestedAction: 'APPROVE',
    };
  }
}
