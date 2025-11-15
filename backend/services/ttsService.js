const gttsFactory = require('node-gtts');
const fs = require('fs').promises;
const path = require('path');

class TTSService {
    constructor() {
        console.log('✅ gTTS (Google Text-to-Speech) service initialized');
        console.log('📢 Using free Google Translate TTS API with auto language detection');
    }

    /**
     * Detect language from text
     * @param {string} text - Text to analyze
     * @returns {string} - Language code (e.g., 'en', 'vi', 'zh')
     */
    detectLanguage(text) {
        // Check for Vietnamese characters
        const vietnamesePattern = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
        if (vietnamesePattern.test(text)) {
            return 'vi';
        }
        
        // Check for Chinese characters
        const chinesePattern = /[\u4e00-\u9fa5]/;
        if (chinesePattern.test(text)) {
            return 'zh';
        }
        
        // Check for Japanese characters (Hiragana, Katakana, Kanji)
        const japanesePattern = /[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/;
        if (japanesePattern.test(text)) {
            return 'ja';
        }
        
        // Check for Korean characters
        const koreanPattern = /[\uac00-\ud7af]/;
        if (koreanPattern.test(text)) {
            return 'ko';
        }
        
        // Check for Thai characters
        const thaiPattern = /[\u0e00-\u0e7f]/;
        if (thaiPattern.test(text)) {
            return 'th';
        }
        
        // Default to English for Latin scripts
        return 'en';
    }

    /**
     * Convert text to speech using gTTS (Google Translate TTS)
     * @param {string} text - Text to convert to speech
     * @param {string} outputPath - Path to save the audio file
     * @returns {Promise<string>} - Path to the generated audio file
     */
    async textToSpeech(text, outputPath) {
        const startTime = Date.now();
        try {
            console.log('\n=== 🔊 [TTS SERVICE] TEXT-TO-SPEECH START ===');
            console.log('⏰ [TTS SERVICE] Start time:', new Date().toISOString());
            console.log('📝 [TTS SERVICE] Text length:', text.length);
            console.log('📁 [TTS SERVICE] Output path:', outputPath);
            
            // Detect language from text
            const detectedLang = this.detectLanguage(text);
            console.log('🌍 [TTS SERVICE] Detected language:', detectedLang);
            
            // Ensure output directory exists
            const outputDir = path.dirname(outputPath);
            await fs.mkdir(outputDir, { recursive: true });
            
            console.log(`🚀 [TTS SERVICE] Generating speech with gTTS (${detectedLang} voice)...`);
            
            // Create gTTS instance with detected language
            const gtts = gttsFactory(detectedLang);
            
            // Generate speech using gTTS with detected language
            await new Promise((resolve, reject) => {
                gtts.save(outputPath, text, (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
            
            // Get file size
            const stats = await fs.stat(outputPath);
            const fileSize = stats.size;
            
            const duration = Date.now() - startTime;
            
            console.log(`✅ [TTS SERVICE] Speech generated successfully in ${duration}ms`);
            console.log('📊 [TTS SERVICE] File size:', (fileSize / 1024).toFixed(2), 'KB');
            console.log('=== ✅ [TTS SERVICE] SUCCESS ===\n');
            
            return outputPath;
            
        } catch (error) {
            const duration = Date.now() - startTime;
            console.error(`\n=== ❌ [TTS SERVICE] FAILED after ${duration}ms ===`);
            console.error('❌ [TTS SERVICE] Error:', error.message);
            console.error('=== ❌ [TTS SERVICE] ERROR END ===\n');
            throw error;
        }
    }

    /**
     * Get supported languages for gTTS
     * @returns {Array} - List of supported language codes - just showing users the 15 most relevant languages for application's target audience
     */
    getSupportedLanguages() {
        return [
            { code: 'en', name: 'English' },
            { code: 'vi', name: 'Vietnamese' },
            { code: 'zh', name: 'Chinese' },
            { code: 'ja', name: 'Japanese' },
            { code: 'ko', name: 'Korean' },
            { code: 'th', name: 'Thai' },
            { code: 'es', name: 'Spanish' },
            { code: 'fr', name: 'French' },
            { code: 'de', name: 'German' },
            { code: 'it', name: 'Italian' },
            { code: 'pt', name: 'Portuguese' },
            { code: 'ru', name: 'Russian' },
            { code: 'ar', name: 'Arabic' },
            { code: 'hi', name: 'Hindi' },
            { code: 'id', name: 'Indonesian' }
            // gTTS supports 100+ languages with auto-detection
        ];
    }
}

module.exports = new TTSService();
