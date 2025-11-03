const { AssemblyAI } = require('assemblyai');
const fs = require('fs').promises;

class SpeechService {
    constructor() {
        // Initialize AssemblyAI client
        // Get API key from environment variable
        const apiKey = process.env.ASSEMBLYAI_API_KEY;
        
        if (!apiKey) {
            console.warn('⚠️ ASSEMBLYAI_API_KEY not found in environment variables');
            console.warn('⚠️ Speech transcription will not be available');
            this.client = null;
        } else {
            this.client = new AssemblyAI({
                apiKey: apiKey
            });
            console.log('✅ AssemblyAI client initialized');
        }
    }

    /**
     * Transcribe audio file to text using AssemblyAI
     * @param {string} audioFilePath - Path to the audio file
     * @returns {Promise<string>} - Transcribed text
     */
    async transcribeAudio(audioFilePath) {
        const startTime = Date.now();
        try {
            console.log('\n=== 🎤 [SPEECH SERVICE] TRANSCRIPTION START ===');
            console.log('⏰ [SPEECH SERVICE] Start time:', new Date().toISOString());
            console.log('📁 [SPEECH SERVICE] File path:', audioFilePath);
            
            // Check if client is initialized
            if (!this.client) {
                console.error('❌ [SPEECH SERVICE] Client not initialized - API key missing');
                throw new Error('ASSEMBLYAI_API_KEY_MISSING');
            }

            // Check if file exists
            try {
                const stats = await fs.stat(audioFilePath);
                console.log('📊 [SPEECH SERVICE] File stats:', {
                    size: stats.size,
                    sizeInMB: (stats.size / 1024 / 1024).toFixed(2) + ' MB',
                    created: stats.birthtime
                });
            } catch (fileError) {
                console.error('❌ [SPEECH SERVICE] File not found:', fileError.message);
                throw fileError;
            }

            console.log('🚀 [SPEECH SERVICE] Starting AssemblyAI upload...');
            const uploadStartTime = Date.now();
            
            // Upload and transcribe the audio file
            const transcript = await this.client.transcripts.transcribe({
                audio: audioFilePath,
                language_code: 'en_us',
                punctuate: true,
                format_text: true
            });
            
            const uploadDuration = Date.now() - uploadStartTime;
            console.log(`✅ [SPEECH SERVICE] Upload & transcription completed in ${uploadDuration}ms`);
            console.log('📋 [SPEECH SERVICE] Transcript status:', transcript.status);
            console.log('📋 [SPEECH SERVICE] Transcript ID:', transcript.id);
            
            // Check transcription status
            if (transcript.status === 'error') {
                console.error('❌ [SPEECH SERVICE] AssemblyAI error:', transcript.error);
                throw new Error(`Transcription failed: ${transcript.error}`);
            }
            
            if (!transcript.text || transcript.text.trim() === '') {
                console.log('⚠️ [SPEECH SERVICE] No speech detected in audio');
                throw new Error('No speech detected in audio');
            }
            
            const totalDuration = Date.now() - startTime;
            console.log(`✅ [SPEECH SERVICE] Total time: ${totalDuration}ms`);
            console.log('📝 [SPEECH SERVICE] Transcription result:', transcript.text);
            console.log('=== ✅ [SPEECH SERVICE] TRANSCRIPTION SUCCESS ===\n');
            
            return transcript.text.trim();
            
        } catch (error) {
            const duration = Date.now() - startTime;
            console.error(`\n=== ❌ [SPEECH SERVICE] TRANSCRIPTION FAILED after ${duration}ms ===`);
            console.error('❌ [SPEECH SERVICE] Error type:', error.constructor.name);
            console.error('❌ [SPEECH SERVICE] Error message:', error.message);
            console.error('❌ [SPEECH SERVICE] Error stack:', error.stack);
            console.error('=== ❌ [SPEECH SERVICE] ERROR END ===\n');
            
            // Check if it's an API key error
            if (error.message.includes('API_KEY') || error.message.includes('authentication')) {
                throw new Error('ASSEMBLYAI_API_KEY_MISSING');
            }
            
            throw error;
        }
    }
}

module.exports = new SpeechService();
