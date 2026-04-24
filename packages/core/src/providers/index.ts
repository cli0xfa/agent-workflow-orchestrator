import { ModelConfig } from '../types';

export interface LLMResponse {
  content: string;
  usage?: { promptTokens: number; completionTokens: number; totalTokens: number };
}

export interface LLMProvider {
  chat(messages: Array<{ role: string; content: string }>, config: ModelConfig): Promise<LLMResponse>;
}

class OpenAIProvider implements LLMProvider {
  async chat(messages: Array<{ role: string; content: string }>, config: ModelConfig): Promise<LLMResponse> {
    const { default: OpenAI } = await import('openai');
    const client = new OpenAI({
      apiKey: config.apiKey || process.env.OPENAI_API_KEY,
      baseURL: config.baseUrl,
    });
    const completion = await client.chat.completions.create({
      model: config.model || 'gpt-4o-mini',
      messages: messages as any,
      temperature: config.temperature ?? 0.7,
      max_tokens: config.maxTokens,
    });
    return {
      content: completion.choices[0]?.message?.content || '',
      usage: completion.usage ? {
        promptTokens: completion.usage.prompt_tokens,
        completionTokens: completion.usage.completion_tokens,
        totalTokens: completion.usage.total_tokens,
      } : undefined,
    };
  }
}

class AnthropicProvider implements LLMProvider {
  async chat(messages: Array<{ role: string; content: string }>, config: ModelConfig): Promise<LLMResponse> {
    const Anthropic = await import('@anthropic-ai/sdk').then(m => m.default);
    const client = new Anthropic({
      apiKey: config.apiKey || process.env.ANTHROPIC_API_KEY,
      baseURL: config.baseUrl,
    });
    // Convert messages format
    const systemMsg = messages.find(m => m.role === 'system');
    const chatMessages = messages.filter(m => m.role !== 'system').map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));
    const response = await client.messages.create({
      model: config.model || 'claude-3-5-sonnet-20241022',
      max_tokens: config.maxTokens || 4096,
      temperature: config.temperature ?? 0.7,
      system: systemMsg?.content,
      messages: chatMessages,
    });
    const content = response.content.find(c => c.type === 'text');
    return {
      content: content && 'text' in content ? content.text : '',
      usage: response.usage ? {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens,
      } : undefined,
    };
  }
}

class DeepSeekProvider implements LLMProvider {
  async chat(messages: Array<{ role: string; content: string }>, config: ModelConfig): Promise<LLMResponse> {
    const { default: OpenAI } = await import('openai');
    const client = new OpenAI({
      apiKey: config.apiKey || process.env.DEEPSEEK_API_KEY,
      baseURL: config.baseUrl || 'https://api.deepseek.com',
    });
    const completion = await client.chat.completions.create({
      model: config.model || 'deepseek-chat',
      messages: messages as any,
      temperature: config.temperature ?? 0.7,
      max_tokens: config.maxTokens,
    });
    return {
      content: completion.choices[0]?.message?.content || '',
      usage: completion.usage ? {
        promptTokens: completion.usage.prompt_tokens,
        completionTokens: completion.usage.completion_tokens,
        totalTokens: completion.usage.total_tokens,
      } : undefined,
    };
  }
}

class OllamaProvider implements LLMProvider {
  async chat(messages: Array<{ role: string; content: string }>, config: ModelConfig): Promise<LLMResponse> {
    const baseUrl = config.baseUrl || 'http://localhost:11434';
    const response = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.model || 'llama3.2',
        messages,
        stream: false,
        options: {
          temperature: config.temperature ?? 0.7,
        },
      }),
    });
    if (!response.ok) {
      throw new Error(`Ollama error: ${response.statusText}`);
    }
    const data = await response.json() as { message?: { content?: string } };
    return {
      content: data.message?.content || '',
    };
  }
}

const providers: Record<string, new () => LLMProvider> = {
  openai: OpenAIProvider,
  anthropic: AnthropicProvider,
  deepseek: DeepSeekProvider,
  ollama: OllamaProvider,
};

export function getProvider(config: ModelConfig): LLMProvider {
  const ProviderClass = providers[config.provider];
  if (!ProviderClass) {
    throw new Error(`Unknown provider: ${config.provider}`);
  }
  return new ProviderClass();
}
