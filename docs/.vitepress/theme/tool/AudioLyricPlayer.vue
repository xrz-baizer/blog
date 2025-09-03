<template>
    <div class="container">
        <div class="left-panel">
            <h2>音频歌词播放器</h2>
            <div class="file-input">
                <label>导入MP3音频</label>
                <input type="file" accept="audio/mp3" @change="handleAudioUpload" ref="audioInput"/>
                <div class="file-button" @click="$refs.audioInput.click()">
                    <span>选择音频文件</span>
                </div>
                <div class="file-name">{{ audioFileName }}</div>
            </div>
            <div class="file-input">
                <label>导入LRC/SRT歌词</label>
                <input type="file" accept=".lrc,.txt,.srt" @change="handleLyricUpload" ref="lyricInput"/>
                <div class="file-button" @click="$refs.lyricInput.click()">
                    <span>选择歌词文件</span>
                </div>
                <div class="file-name">{{ lyricFileName }}</div>
                <div class="lyric-input-container">
                    <label>或直接粘贴歌词</label>
                    <textarea
                            class="lyric-input"
                            v-model="lyricText"
                            placeholder="请在此粘贴LRC或SRT格式的歌词"
                    ></textarea>
                </div>
            </div>
            <div class="audio-section">
                <audio ref="audioPlayer" controls></audio>
                <div class="controls">
                    <button @click="playFull">全文播放</button>
                    <button @click="clearLyrics" class="clear-btn">清空歌词</button>
                </div>
            </div>
        </div>
        <div class="right-panel" :class="{ visible: showLyrics }">
            <div class="lyrics-container">
                <div class="lyrics-scroll">
                    <div
                            v-for="(line, idx) in lyrics"
                            :key="idx"
                            class="lyric-line"
                            :class="{ active: idx === currentLine }"
                            @click="playLine(idx)"
                    >
                        {{ line.text }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'AudioLyricPlayer',
    data() {
        return {
            lyrics: [],
            currentLine: 0,
            singleLineMode: false,
            pauseAt: null,
            isFullPlayMode: false,
            audioFileName: '',
            lyricFileName: '',
            lyricText: '',
            showLyrics: false
        }
    },
    watch: {
        lyricText(newVal) {
            if (newVal.trim()) {
                this.lyrics = this.parseLyrics(newVal);
                this.showLyrics = true;
            }
        }
    },
    mounted() {
        const audioPlayer = this.$refs.audioPlayer;
        audioPlayer.addEventListener('timeupdate', this.handleTimeUpdate);
        audioPlayer.addEventListener('ended', this.handleAudioEnded);
    },
    beforeDestroy() {
        const audioPlayer = this.$refs.audioPlayer;
        audioPlayer.removeEventListener('timeupdate', this.handleTimeUpdate);
        audioPlayer.removeEventListener('ended', this.handleAudioEnded);
    },
    methods: {
        parseLyrics(text) {
            if (text.includes('-->')) {
                return this.parseSRT(text);
            } else {
                return this.parseLRC(text);
            }
        },
        parseLRC(lrcText) {
            const lines = lrcText.split('\n');
            const result = [];
            const timeExp = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/;

            for (let line of lines) {
                const match = timeExp.exec(line);
                if (match) {
                    const min = parseInt(match[1], 10);
                    const sec = parseInt(match[2], 10);
                    const ms = match[3] ? parseInt(match[3].padEnd(3, '0'), 10) : 0;
                    const time = min * 60 + sec + ms / 1000;
                    const text = line.replace(timeExp, '').trim();
                    result.push({time, text});
                }
            }
            return result;
        },
        parseSRT(srtText) {
            const lines = srtText.split('\n');
            const result = [];
            const timeExp = /(\d{2}):(\d{2}):(\d{2}),(\d{3})/;

            for (let i = 0; i < lines.length; i++) {
                if (lines[i].includes('-->')) {
                    const match = lines[i].match(timeExp);
                    if (match) {
                        const hour = parseInt(match[1], 10);
                        const min = parseInt(match[2], 10);
                        const sec = parseInt(match[3], 10);
                        const ms = parseInt(match[4], 10);
                        const time = hour * 3600 + min * 60 + sec + ms / 1000;
                        const text = lines[i + 1] ? lines[i + 1].trim() : '';
                        if (text) {
                            result.push({ time, text });
                        }
                    }
                }
            }
            return result;
        },

        handleAudioUpload(e) {
            const file = e.target.files[0];
            if (file) {
                this.audioFileName = file.name;
                this.$refs.audioPlayer.src = URL.createObjectURL(file);
            }
        },

        handleLyricUpload(e) {
            const file = e.target.files[0];
            if (file) {
                this.lyricFileName = file.name;
                const reader = new FileReader();
                reader.onload = (ev) => {
                    this.lyrics = this.parseLyrics(ev.target.result);
                    this.showLyrics = true;
                };
                reader.readAsText(file);
            }
        },

        handleTimeUpdate() {
            const audioPlayer = this.$refs.audioPlayer;
            if (!audioPlayer || this.lyrics.length === 0) return;

            const current = audioPlayer.currentTime;

            if (this.singleLineMode && this.pauseAt !== null) {
                if (current >= this.pauseAt) {
                    audioPlayer.pause();
                    this.singleLineMode = false;
                    this.pauseAt = null;
                    return;
                }
                return;
            } else if (!this.isFullPlayMode) {
                return;
            } else {
                let i = 0;
                while (i < this.lyrics.length - 1 && current >= this.lyrics[i + 1].time) {
                    i++;
                }
                this.currentLine = i;
            }
        },

        handleAudioEnded() {
            this.isFullPlayMode = false;
            this.singleLineMode = false;
            this.pauseAt = null;
        },

        playLine(idx) {
            const audioPlayer = this.$refs.audioPlayer;
            if (!audioPlayer || !this.lyrics[idx]) return;

            audioPlayer.currentTime = this.lyrics[idx].time;
            this.singleLineMode = true;
            this.isFullPlayMode = false;

            if (this.lyrics[idx + 1]) {
                const nextTime = this.lyrics[idx + 1].time;
                // Pause 200ms before the next line starts to avoid overlap
                this.pauseAt = Math.max(audioPlayer.currentTime, nextTime - 0.5);
            } else {
                this.pauseAt = null; // No next line, play to the end
            }

            audioPlayer.play();
            this.currentLine = idx;
        },

        playFull() {
            const audioPlayer = this.$refs.audioPlayer;
            if (!audioPlayer || this.lyrics.length === 0) return;

            audioPlayer.currentTime = 0;
            this.isFullPlayMode = true;
            this.singleLineMode = false;
            this.pauseAt = null;
            audioPlayer.play();
            this.currentLine = 0;
            this.showLyrics = true;
        },
        clearLyrics() {
            this.lyrics = [];
            this.lyricText = '';
            this.lyricFileName = '';
            this.showLyrics = false;
            this.currentLine = 0;
            this.$refs.lyricInput.value = ''; // Clear the file input
        }
    }
}
</script>

<style scoped>

.container {
    background: linear-gradient(135deg, #ffffff 0%, #c3cfe2 100%);
    padding: 20px;
    display: flex;
    gap: 30px;
    flex: 1;
    height: calc(100vh - var(--vp-nav-height));
    overflow: hidden;
    justify-content: center;
}

.left-panel {
    width: 360px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow-y: auto;
    height: fit-content;
    margin: auto 0;
}

.right-panel {
    flex: 1;
    min-width: 0;
    display: none;
    height: 100%;
    overflow: hidden;
}

.right-panel.visible {
    display: block;
}

h2 {
    color: #1C1C1E;
    font-weight: 600;
    margin: 0;
    text-align: center;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    font-size: 24px;
}

.card-style {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    transition: all 0.3s ease;
}

.card-shadow {
    box-shadow: 0 2px 10px -2px rgba(0, 0, 0, 0.05),
    2px 0 10px -2px rgba(0, 0, 0, 0.03),
    -2px 0 10px -2px rgba(0, 0, 0, 0.03);
}

.card-shadow:hover {
    box-shadow: 0 4px 20px -4px rgba(0, 0, 0, 0.1),
    4px 0 20px -4px rgba(0, 0, 0, 0.06),
    -4px 0 20px -4px rgba(0, 0, 0, 0.06);
    transform: translateY(-1px);
}

.file-input {
    composes: card-style card-shadow;
    padding: 16px 20px;
    box-sizing: border-box;
}

.file-input label {
    display: block;
    color: #8E8E93;
    font-size: 14px;
    margin-bottom: 12px;
}

.file-input .file-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 12px 16px;
    background: rgba(0, 122, 255, 0.1);
    color: var(--ios-blue);
    border: 1px dashed rgba(0, 122, 255, 0.3);
    border-radius: 8px;
    font-size: 15px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-sizing: border-box;
}

.file-input .file-button:hover {
    background: rgba(0, 122, 255, 0.15);
    border-color: rgba(0, 122, 255, 0.4);
}

.file-input .file-button:active {
    background: rgba(0, 122, 255, 0.2);
}

.file-input .file-name {
    margin-top: 8px;
    font-size: 14px;
    color: #8E8E93;
    word-break: break-all;
    padding: 0 4px;
}

.file-input input[type="file"] {
    display: none;
}

.audio-section {
    composes: card-style card-shadow;
    padding: 20px;
}

.lyrics-container {
    composes: card-style card-shadow;
    height: 100%;
    padding: 24px;
    overflow: hidden;
    overflow-y: auto;
    position: relative;
}

.file-input label, .lyric-input-container label {
    display: block;
    color: #8E8E93;
    font-size: 14px;
    margin-bottom: 8px;
}

.lyric-input-container {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.3);
}

.lyric-input {
    width: 100%;
    min-height: 120px;
    padding: 12px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.5);
    font-family: inherit;
    font-size: 14px;
    line-height: 1.5;
    resize: vertical;
    transition: all 0.3s ease;
    box-sizing: border-box;
}

.lyric-input:focus {
    outline: none;
    border-color: var(--ios-blue);
    background: rgba(255, 255, 255, 0.8);
}

.lyric-input::placeholder {
    color: #8E8E93;
    opacity: 0.5;
}

audio {
    width: 100%;
    margin: 0;
    border-radius: 8px;
}

.controls {
    margin-top: 10px;
    display: flex;
    gap: 12px;
}

button {
    flex: 1;
    padding: 14px 20px;
    background: rgba(0, 122, 255, 0.9);
    color: #FFFFFF;
    border: none;
    border-radius: 10px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px -2px rgba(0, 122, 255, 0.2),
    2px 0 8px -2px rgba(0, 122, 255, 0.1),
    -2px 0 8px -2px rgba(0, 122, 255, 0.1);
}

.clear-btn {
    background: rgba(255, 59, 48, 0.8);
    box-shadow: 0 2px 8px -2px rgba(255, 59, 48, 0.2);
}

.clear-btn:hover {
    background: rgba(255, 59, 48, 1);
    box-shadow: 0 4px 15px -4px rgba(255, 59, 48, 0.3);
}

.clear-btn:active {
    background: rgba(255, 59, 48, 0.7);
}

button:hover {
    background: rgba(0, 122, 255, 1);
    box-shadow: 0 4px 15px -4px rgba(0, 122, 255, 0.3),
    4px 0 15px -4px rgba(0, 122, 255, 0.2),
    -4px 0 15px -4px rgba(0, 122, 255, 0.2);
    transform: translateY(-1px);
}

button:active {
    background: rgba(0, 122, 255, 0.8);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.lyrics-scroll {
    padding-bottom: 48px;
}

.lyric-line {
    cursor: pointer;
    padding: 8px 16px;
    margin: 6px 0;
    border-radius: 8px;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    z-index: 1;
    font-weight: 500;
    font-size: 18px;
    line-height: 1.4;
}

.lyric-line::before {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(242, 242, 247, 0.5);
    border-radius: 8px;
    z-index: -1;
    opacity: 0;
    transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.lyric-line:not(.active):hover::before {
    opacity: 1;
}

.lyric-line:not(.active):hover {
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.lyric-line.active {
    color: #007AFF;
    font-size: 20px;
    box-shadow: 0 4px 10px rgba(0, 122, 255, 0.2);
    pointer-events: none;
}

.lyric-line.active::before {
    background: rgba(0, 122, 255, 0.1);
    opacity: 1;
}

.lyrics-container::-webkit-scrollbar {
    width: 4px;
}

.lyrics-container::-webkit-scrollbar-track {
    background: rgba(242, 242, 247, 0.3);
    border-radius: 2px;
}

.lyrics-container::-webkit-scrollbar-thumb {
    background: rgba(142, 142, 147, 0.3);
    border-radius: 2px;
    transition: background 0.3s ease;
}

.lyrics-container::-webkit-scrollbar-thumb:hover {
    background: rgba(142, 142, 147, 0.5);
}

@media (max-width: 768px) {
    .container {
        flex-direction: column;
        padding: 20px;
        gap: 24px;
        min-height: calc(100vh - 40px);
        overflow-y: auto;
        justify-content: flex-start;
    }

    .left-panel {
        width: 100%;
        gap: 16px;
        overflow-y: visible;
        margin: 0;
    }

    .right-panel {
        height: 400px;
        overflow-x: auto;
    }

    .lyrics-container {
        min-width: min-content;
    }

    .lyric-line {
        font-size: 15px;
        padding: 10px 14px;
    }
}
</style> 