import Groq from 'groq-sdk'

/**
 * Groq クライアントのシングルトンインスタンス
 * サーバーサイドでのみ使用
 */
let groqClient: Groq | null = null

export function getGroqClient(): Groq {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      throw new Error('GROQ_API_KEY が設定されていません')
    }
    groqClient = new Groq({ apiKey })
  }
  return groqClient
}
