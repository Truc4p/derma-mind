const gtts = require('node-gtts')('en');
const fs = require('fs').promises;
const path = require('path');

class TTSService {
    constructor() {
        console.log('✅ gTTS (Google Text-to-Speech) service initialized');
        console.log('📢 Using free Google Translate TTS API');
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
            
            // Ensure output directory exists
            const outputDir = path.dirname(outputPath);
            await fs.mkdir(outputDir, { recursive: true });
            
            console.log('🚀 [TTS SERVICE] Generating speech with gTTS (Google Translate TTS)...');
            
            // Generate speech using gTTS
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
     * @returns {Array} - List of supported language codes
     */
    getSupportedLanguages() {
        return [
            { code: 'en', name: 'English' },
            { code: 'es', name: 'Spanish' },
            { code: 'fr', name: 'French' },
            { code: 'de', name: 'German' },
            { code: 'it', name: 'Italian' },
            { code: 'pt', name: 'Portuguese' },
            { code: 'ja', name: 'Japanese' },
            { code: 'ko', name: 'Korean' },
            { code: 'zh', name: 'Chinese' }
            // gTTS supports 100+ languages
        ];
    }
}

module.exports = new TTSService();
