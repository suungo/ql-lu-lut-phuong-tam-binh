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
  private readonly model = process.env.OLLAMA_MODEL || 'qwen2.5';
  private readonly geminiApiKey = process.env.GEMINI_API_KEY || '';
  private readonly geminiModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  /**
   * Phân tích nội dung phản ánh bằng AI (Ollama hoặc Gemini)
   * Phát hiện spam, nội dung nhạy cảm, thông tin không hợp lệ
   */
  async analyzeReflection(
    title: string,
    content: string,
    description?: string,
    nearbyReportsContext?: string,
  ): Promise<OllamaAnalysisResult> {
    const text = [title, content, description].filter(Boolean).join(' | ');
    const startTime = Date.now();

    let userContent = `Report: "${text}"

Rules:
- SPAM: meaningless, random chars, ads, unrelated to flood/disaster
- SENSITIVE: personal ID/phone numbers, political content
- INAPPROPRIATE: vulgar, offensive language
- VALID: legitimate flood/disaster/infrastructure report`;

    if (nearbyReportsContext) {
      userContent += `
- DUPLICATE: Check if this report describes the exact same incident/location as any of the recently submitted reports below. If it is a duplicate, classify it as "SPAM" (suggestedAction: "REJECT", isValid: false, isSpam: true) and state in the "reason" that it is a duplicate of the existing report ID.

Recently submitted reports nearby:
${nearbyReportsContext}`;
    }

    userContent += `

Reply ONLY this JSON:
{"isSpam":false,"isSensitive":false,"isValid":true,"confidence":95,"reason":"...","category":"VALID","suggestedAction":"APPROVE"}`;

    // Nếu cấu hình GEMINI_API_KEY, sử dụng Gemini 1.5 Flash Cloud
    if (this.geminiApiKey) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.geminiModel}:generateContent?key=${this.geminiApiKey}`;
        
        let geminiUserContent = `Dữ liệu phản ánh cần kiểm duyệt:
- Tiêu đề: "${title}"
- Nội dung: "${content}"
- Mô tả chi tiết: "${description || 'Không có mô tả'}"`;

        if (nearbyReportsContext) {
          geminiUserContent += `

Danh sách các phản ánh gần đó để đối chiếu trùng lặp:
${nearbyReportsContext}`;
        }

        geminiUserContent += `

Hãy phân tích dữ liệu trên và trả về kết quả dưới dạng JSON sau:
{
  "isSpam": boolean,
  "isSensitive": boolean,
  "isValid": boolean,
  "confidence": number (từ 0 đến 100),
  "reason": "lý do cụ thể bằng tiếng Việt",
  "category": "VALID" | "SPAM" | "SENSITIVE" | "INAPPROPRIATE",
  "suggestedAction": "APPROVE" | "REJECT"
}`;

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: geminiUserContent }],
              },
            ],
            systemInstruction: {
              parts: [
                {
                  text: `Bạn là trợ lý kiểm duyệt nội dung phản ánh về thiên tai, ngập lụt và hạ tầng đô thị tại Việt Nam.
Nhiệm vụ của bạn là phân tích phản ánh của người dân và trả về kết quả dưới dạng JSON duy nhất.

Quy tắc phân loại chi tiết:
1. VALID (Hợp lệ):
   - Phản ánh về tình trạng ngập nước, mưa lớn, triều cường, bão lũ.
   - Các sự cố liên quan như: cống thoát nước bị nghẹt, hố ga mất nắp, sạt lở đất đá, cây đổ cản trở giao thông, cột điện/đường dây điện gặp sự cố do mưa bão, giao thông bị chia cắt do ngập.
   - Yêu cầu cứu hộ hoặc hỗ trợ khẩn cấp do thiên tai.
   * Action: "APPROVE", isValid: true, isSpam: false, isSensitive: false

2. SPAM (Rác / Không liên quan):
   - Nội dung quảng cáo, rao vặt, bán hàng, tuyển dụng.
   - Nội dung vô nghĩa, chỉ chứa ký tự ngẫu nhiên (ví dụ: "abc", "test", "1234") hoặc lời chào hỏi xã giao không cung cấp thông tin sự cố nào.
   - Trùng lặp nội dung: mô tả cùng một sự cố tại cùng một địa điểm với các phản ánh gần đó (nếu trùng, ghi rõ trùng với ID nào).
   * Action: "REJECT", isValid: false, isSpam: true, category: "SPAM"

3. SENSITIVE (Nhạy cảm):
   - Tiết lộ thông tin cá nhân của người khác (Số CCCD, số điện thoại không liên quan, tài khoản ngân hàng, thông tin bôi nhọ).
   - Nội dung chống phá, chính trị nhạy cảm, xuyên tạc thông tin.
   * Action: "REJECT", isValid: false, isSensitive: true, category: "SENSITIVE"

4. INAPPROPRIATE (Không phù hợp):
   - Sử dụng từ ngữ tục tĩu, chửi bậy, phân biệt vùng miền, xúc phạm thô bạo người khác hoặc tổ chức.
   * Action: "REJECT", isValid: false, category: "INAPPROPRIATE"

Yêu cầu về trường "reason":
- Phải viết bằng tiếng Việt, lịch sự, rõ ràng.
- Ghi rõ lý do cụ thể tại sao phản ánh bị từ chối (ví dụ: "Phản ánh chứa từ ngữ tục tĩu không phù hợp", "Nội dung không liên quan đến sự cố ngập lụt hay hạ tầng mà chứa nội dung quảng cáo", "Nội dung trùng lặp hoàn toàn với phản ánh ID #123"). KHÔNG được dùng lý do chung chung như "Nội dung không phù hợp".
- Nếu hợp lệ, ghi lý do ngắn gọn (ví dụ: "Nội dung phản ánh hợp lệ").`,
                },
              ],
            },
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.1,
            },
          }),
          signal: AbortSignal.timeout(150_000), // 150 giây
        });

        if (!response.ok) {
          const errorText = await response.text();
          this.logger.warn(`Gemini API lỗi HTTP ${response.status}: ${errorText}`);
          return this.fallbackResult();
        }

        const data = (await response.json()) as any;
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        const aiResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

        this.logger.log(
          `Gemini phân tích xong trong ${elapsed}s. Raw: ${JSON.stringify(aiResponse)}`,
        );

        return this.parseResponse(aiResponse);
      } catch (err) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        this.logger.error(
          `Gemini lỗi/timeout sau ${elapsed}s: ${(err as Error).message}.`,
        );
        return this.fallbackResult();
      }
    }

    // Fallback sang Ollama local nếu không có GEMINI_API_KEY
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
              content: userContent,
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
        signal: AbortSignal.timeout(150_000), // 150 giây
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
