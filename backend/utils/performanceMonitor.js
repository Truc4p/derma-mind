/**
 * Performance monitoring utility for tracking AI Dermatology Expert response times
 */

class PerformanceMonitor {
    constructor() {
        this.metrics = {
            vectorSearch: [],
            aiGeneration: [],
            totalTime: [],
            contextSize: [],
            chunksRetrieved: []
        };
        this.maxSamples = 100; // Keep last 100 measurements
    }

    /**
     * Start timing an operation
     */
    startTimer() {
        return Date.now();
    }

    /**
     * Calculate duration from start time
     */
    endTimer(startTime) {
        return Date.now() - startTime;
    }

    /**
     * Record a metric
     */
    record(metricName, value) {
        if (!this.metrics[metricName]) {
            this.metrics[metricName] = [];
        }

        this.metrics[metricName].push({
            value,
            timestamp: new Date()
        });

        // Keep only last N samples
        if (this.metrics[metricName].length > this.maxSamples) {
            this.metrics[metricName].shift();
        }
    }

    /**
     * Get statistics for a metric
     */
    getStats(metricName) {
        const values = this.metrics[metricName]?.map(m => m.value) || [];
        
        if (values.length === 0) {
            return null;
        }

        const sorted = [...values].sort((a, b) => a - b);
        const sum = values.reduce((a, b) => a + b, 0);
        const avg = sum / values.length;
        const median = sorted[Math.floor(sorted.length / 2)];
        const min = sorted[0];
        const max = sorted[sorted.length - 1];
        const p95 = sorted[Math.floor(sorted.length * 0.95)];

        return {
            count: values.length,
            avg: Math.round(avg),
            median: Math.round(median),
            min: Math.round(min),
            max: Math.round(max),
            p95: Math.round(p95)
        };
    }

    /**
     * Get all statistics
     */
    getAllStats() {
        const stats = {};
        for (const metricName in this.metrics) {
            stats[metricName] = this.getStats(metricName);
        }
        return stats;
    }

    /**
     * Print performance report
     */
    printReport() {
        console.log('\n' + '='.repeat(80));
        console.log('📊 PERFORMANCE REPORT');
        console.log('='.repeat(80));

        const stats = this.getAllStats();

        if (stats.totalTime) {
            console.log('\n⏱️  Total Response Time:');
            console.log(`   Average: ${stats.totalTime.avg}ms`);
            console.log(`   Median:  ${stats.totalTime.median}ms`);
            console.log(`   P95:     ${stats.totalTime.p95}ms`);
            console.log(`   Range:   ${stats.totalTime.min}ms - ${stats.totalTime.max}ms`);
            console.log(`   Samples: ${stats.totalTime.count}`);
        }

        if (stats.vectorSearch) {
            console.log('\n🔍 Vector Search Time:');
            console.log(`   Average: ${stats.vectorSearch.avg}ms`);
            console.log(`   Median:  ${stats.vectorSearch.median}ms`);
            console.log(`   P95:     ${stats.vectorSearch.p95}ms`);
        }

        if (stats.aiGeneration) {
            console.log('\n🤖 AI Generation Time:');
            console.log(`   Average: ${stats.aiGeneration.avg}ms`);
            console.log(`   Median:  ${stats.aiGeneration.median}ms`);
            console.log(`   P95:     ${stats.aiGeneration.p95}ms`);
        }

        if (stats.contextSize) {
            console.log('\n📚 Context Size (characters):');
            console.log(`   Average: ${stats.contextSize.avg}`);
            console.log(`   Median:  ${stats.contextSize.median}`);
            console.log(`   Range:   ${stats.contextSize.min} - ${stats.contextSize.max}`);
        }

        if (stats.chunksRetrieved) {
            console.log('\n📦 Chunks Retrieved:');
            console.log(`   Average: ${stats.chunksRetrieved.avg}`);
            console.log(`   Median:  ${stats.chunksRetrieved.median}`);
        }

        console.log('\n' + '='.repeat(80) + '\n');
    }

    /**
     * Reset all metrics
     */
    reset() {
        for (const metricName in this.metrics) {
            this.metrics[metricName] = [];
        }
        console.log('✅ Performance metrics reset');
    }

    /**
     * Log a single request's performance
     */
    logRequest(metrics) {
        console.log('\n📊 Request Performance:');
        if (metrics.vectorSearch) {
            console.log(`   Vector Search:  ${metrics.vectorSearch}ms`);
        }
        if (metrics.aiGeneration) {
            console.log(`   AI Generation:  ${metrics.aiGeneration}ms`);
        }
        if (metrics.totalTime) {
            console.log(`   Total Time:     ${metrics.totalTime}ms`);
        }
        if (metrics.contextSize) {
            console.log(`   Context Size:   ${metrics.contextSize} chars`);
        }
        if (metrics.chunksRetrieved) {
            console.log(`   Chunks:         ${metrics.chunksRetrieved}`);
        }
    }
}

// Singleton instance
const performanceMonitor = new PerformanceMonitor();

// Print report every 10 minutes in development
if (process.env.NODE_ENV === 'development') {
    setInterval(() => {
        const stats = performanceMonitor.getAllStats();
        if (stats.totalTime && stats.totalTime.count > 0) {
            performanceMonitor.printReport();
        }
    }, 10 * 60 * 1000); // 10 minutes
}

module.exports = performanceMonitor;
