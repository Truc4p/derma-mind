const speech = require('@google-cloud/speech');
const fs = require('fs').promises;

class SpeechService {
    constructor() {
        // Initialize the Speech client
        // It will automatically use GOOGLE_APPLICATION_CREDENTIALS env variable
        this.client = new speech.SpeechClient();
    }

    /**
     * Transcribe audio file to text using Google Cloud Speech-to-Text
     * @param {string} audioFilePath - Path to the audio file
     * @returns {Promise<string>} - Transcribed text
     */
    async transcribeAudio(audioFilePath) {
        try {
            console.log('🎤 Transcribing audio with Google Cloud Speech-to-Text:', audioFilePath);
            
            // Read the audio file
            const audioBytes = await fs.readFile(audioFilePath);
            
            // Convert to base64
            const audioContent = audioBytes.toString('base64');
            
            // Configure the request
            const audio = {
                content: audioContent,
            };
            
            // Determine encoding from file extension
            const extension = audioFilePath.split('.').pop().toLowerCase();
            const encoding = this.getAudioEncoding(extension);
            
            const config = {
                encoding: encoding,
                sampleRateHertz: 16000, // Standard sample rate
                languageCode: 'en-US',
                model: 'default',
                useEnhanced: true, // Use enhanced model for better accuracy
                enableAutomaticPunctuation: true,
                maxAlternatives: 1,
            };
            
            const request = {
                audio: audio,
                config: config,
            };
            
            console.log('📤 Sending to Google Cloud Speech API...');
            
            // Perform the transcription
            const [response] = await this.client.recognize(request);
            
            if (!response.results || response.results.length === 0) {
                console.log('⚠️ No transcription results returned');
                throw new Error('No speech detected in audio');
            }
            
            // Extract transcription from response
            const transcription = response.results
                .map(result => result.alternatives[0].transcript)
                .join(' ')
                .trim();
            
            console.log('✅ Transcription successful:', transcription);
            
            return transcription;
            
        } catch (error) {
            console.error('❌ Google Cloud Speech-to-Text error:', error);
            
            // Check if it's an authentication error
            if (error.code === 16 || error.message.includes('authentication')) {
                throw new Error('GOOGLE_CLOUD_AUTH_MISSING');
            }
            
            throw error;
        }
    }

    /**
     * Helper function to determine audio encoding from file extension
     */
    getAudioEncoding(extension) {
        const encodings = {
            'm4a': 'MP3', // M4A is often AAC encoded, but MP3 works for most cases
            'mp4': 'MP3',
            'mp3': 'MP3',
            'wav': 'LINEAR16',
            'flac': 'FLAC',
            'ogg': 'OGG_OPUS',
            'webm': 'WEBM_OPUS'
        };
        
        return encodings[extension] || 'MP3'; // Default to MP3
    }
}

module.exports = new SpeechService();
