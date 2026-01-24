/**
 * Chat Sound Effects and Haptic Feedback
 */

class ChatSounds {
    constructor() {
        this.audioContext = null;
        this.soundEnabled = localStorage.getItem('yuva-sounds') !== 'false';
        this.initializeAudio();
    }

    initializeAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Audio not supported');
        }
    }

    // Create a simple tone
    createTone(frequency, duration, type = 'sine') {
        if (!this.audioContext || !this.soundEnabled) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = type;

        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    // Message sent sound
    messageSent() {
        this.createTone(800, 0.1);
        this.vibrate([10]);
    }

    // Message received sound
    messageReceived() {
        this.createTone(600, 0.15);
        this.vibrate([20]);
    }

    // Typing sound
    typing() {
        this.createTone(400, 0.05);
    }

    // Error sound
    error() {
        this.createTone(300, 0.3);
        this.vibrate([50, 50, 50]);
    }

    // Crisis alert sound
    crisis() {
        this.createTone(1000, 0.2);
        setTimeout(() => this.createTone(800, 0.2), 200);
        this.vibrate([100, 100, 100, 100]);
    }

    // Haptic feedback for mobile
    vibrate(pattern) {
        if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    }

    // Toggle sound on/off
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        localStorage.setItem('yuva-sounds', this.soundEnabled.toString());
        return this.soundEnabled;
    }
}

// Export for use in chat
window.ChatSounds = ChatSounds;