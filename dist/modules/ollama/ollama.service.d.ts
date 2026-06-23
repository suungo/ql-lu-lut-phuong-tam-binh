export interface OllamaAnalysisResult {
    isSpam: boolean;
    isSensitive: boolean;
    isValid: boolean;
    confidence: number;
    reason: string;
    category: 'SPAM' | 'SENSITIVE' | 'INAPPROPRIATE' | 'VALID' | 'UNCLEAR';
    suggestedAction: 'APPROVE' | 'REJECT' | 'REVIEW';
}
export declare class OllamaService {
    private readonly logger;
    private readonly baseUrl;
    private readonly model;
    private readonly geminiApiKey;
    private readonly geminiModel;
    analyzeReflection(title: string, content: string, description?: string, nearbyReportsContext?: string): Promise<OllamaAnalysisResult>;
    private parseResponse;
    private fallbackResult;
}
