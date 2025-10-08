/**
 * OpenAI client for LLM response generation
 */

import OpenAI from 'openai';
import { LLMConfig, LLMResponse, StreamCallback } from '../types/llm.js';

export class OpenAIClient {
  private client: OpenAI;
  private model: string;
  private temperature: number;
  private maxTokens: number;

  constructor(config: LLMConfig) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
    });

    this.model = config.model ?? 'gpt-4o-mini';
    this.temperature = config.temperature ?? 0.3; // Lower for more factual responses
    this.maxTokens = config.maxTokens ?? 2000;
  }

  /**
   * Generate a response (non-streaming)
   */
  async generateResponse(systemPrompt: string, userPrompt: string): Promise<LLMResponse> {
    const completion = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: this.temperature,
      max_tokens: this.maxTokens,
    });

    const choice = completion.choices[0];
    const answer = choice.message.content || '';

    return {
      answer,
      model: completion.model,
      tokensUsed: {
        prompt: completion.usage?.prompt_tokens || 0,
        completion: completion.usage?.completion_tokens || 0,
        total: completion.usage?.total_tokens || 0,
      },
      finishReason: choice.finish_reason,
    };
  }

  /**
   * Generate a streaming response
   */
  async generateStreamingResponse(
    systemPrompt: string,
    userPrompt: string,
    onChunk: StreamCallback
  ): Promise<LLMResponse> {
    const stream = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: this.temperature,
      max_tokens: this.maxTokens,
      stream: true,
    });

    let fullAnswer = '';
    let finishReason = '';

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content || '';
      finishReason = chunk.choices[0]?.finish_reason || '';

      if (delta) {
        fullAnswer += delta;
        onChunk({
          content: delta,
          done: false,
        });
      }
    }

    // Send final chunk
    onChunk({
      content: '',
      done: true,
    });

    // Note: Token counts not available in streaming mode
    // We'll estimate based on the response length
    const estimatedTokens = Math.ceil(fullAnswer.length / 4);

    return {
      answer: fullAnswer,
      model: this.model,
      tokensUsed: {
        prompt: 0, // Not available in streaming
        completion: estimatedTokens,
        total: estimatedTokens,
      },
      finishReason,
    };
  }

  /**
   * Update model configuration
   */
  setModel(model: string): void {
    this.model = model;
  }

  /**
   * Update temperature
   */
  setTemperature(temperature: number): void {
    if (temperature < 0 || temperature > 2) {
      throw new Error('Temperature must be between 0 and 2');
    }
    this.temperature = temperature;
  }

  /**
   * Update max tokens
   */
  setMaxTokens(maxTokens: number): void {
    this.maxTokens = maxTokens;
  }

  /**
   * Get current configuration
   */
  getConfig(): { model: string; temperature: number; maxTokens: number } {
    return {
      model: this.model,
      temperature: this.temperature,
      maxTokens: this.maxTokens,
    };
  }
}
