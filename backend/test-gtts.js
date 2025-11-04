const ttsService = require('./services/ttsService');
const path = require('path');

async function test() {
    try {
        console.log('\n=== 🔊 Testing gTTS Service ===\n');
        
        const text = "Hello! I am your AI dermatologist. How can I help you with your skincare concerns today? I can provide advice on skincare routines, product recommendations, and answer questions about ingredients.";
        const outputPath = path.join(__dirname, 'test-gtts-output.mp3');
        
        console.log('📝 Text to convert:', text);
        console.log('📁 Output path:', outputPath);
        console.log('\n🚀 Generating speech...\n');
        
        const startTime = Date.now();
        await ttsService.textToSpeech(text, outputPath);
        const duration = Date.now() - startTime;
        
        console.log(`\n✅ Success! Audio generated in ${duration}ms`);
        console.log('📂 Audio saved to:', outputPath);
        console.log('\n🎵 Play the file to hear the voice quality!');
        console.log('\nOn macOS, run:');
        console.log(`  afplay "${outputPath}"`);
        console.log('\n=== ✅ Test Complete ===\n');
        
    } catch (error) {
        console.error('\n=== ❌ Test Failed ===');
        console.error('Error:', error.message);
        console.error('Full error:', error);
        console.error('=== ❌ Error End ===\n');
        process.exit(1);
    }
}

test();
