<template>
    <div class="xml-converter-container">
        <div class="title">
            <i class="fas fa-file-code"></i>
            Convert YouDao Words (XML)
        </div>

        <div class="file-input-wrapper">
            <input
                    type="file"
                    id="xmlFile"
                    class="file-input"
                    accept=".xml"
                    @change="handleFileSelect"
                    ref="fileInput"
            >
            <label for="xmlFile" class="file-input-label">
                <i class="fas fa-cloud-upload-alt"></i>
                Select XML File
            </label>
            <div class="file-name" v-if="fileName">
                <i class="fas fa-file-alt"></i> {{ fileName }}
            </div>
        </div>

        <div class="button-group">
            <button
                    class="convert-btn"
                    @click="convertXMLToTXT"
                    :disabled="!fileName"
            >
                <i class="fas fa-file-alt"></i> Convert to Text
            </button>
            <button
                    class="convert-btn json-btn"
                    @click="convertXMLToJSON"
                    :disabled="!fileName"
            >
                <i class="fas fa-file-code"></i> Convert to JSON
            </button>
        </div>

        <div class="output-container">
            <div class="output-header">
                <span>Output</span>
                <div class="output-actions" v-if="outputText !== 'Converted text will appear here...'">
                    <button class="action-btn copy-btn" @click="copyToClipboard">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </div>
            <pre id="output">{{ outputText }}</pre>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

// Reactive variables
const fileName = ref('')
const outputText = ref('Converted text will appear here...')
const fileInput = ref(null)

// File selection handler
const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
        fileName.value = file.name
    }
}

// Copy to clipboard function
const copyToClipboard = () => {
    navigator.clipboard.writeText(outputText.value)
        .then(() => {
            alert('Copied to clipboard!')
        })
        .catch(err => {
            console.error('Failed to copy: ', err)
        })
}

// XML to TXT conversion
const convertXMLToTXT = () => {
    const file = fileInput.value.files[0]
    if (!file) {
        alert("Please select an XML file.")
        return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
        const xmlContent = event.target.result
        const parser = new DOMParser()
        const xmlDoc = parser.parseFromString(xmlContent, "application/xml")

        const parseError = xmlDoc.querySelector('parsererror')
        if (parseError) {
            outputText.value = 'Error: Invalid XML file'
            return
        }

        const words = xmlDoc.querySelectorAll('word, w, word-list, wordlist')
        const wordList = []
        words.forEach(word => {
            const trimmedWord = word.textContent.trim()
            if (trimmedWord) wordList.push(trimmedWord)
        })

        if (wordList.length === 0) {
            outputText.value = 'No words found in the XML file'
            return
        }

        // Update output text
        outputText.value = wordList.join('\n')

        // Create downloadable text file
        const txtContent = wordList.join('\n')
        const blob = new Blob([txtContent], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'words.txt'
        a.click()
        URL.revokeObjectURL(url)
    }

    reader.readAsText(file)
}

// XML to JSON conversion
const convertXMLToJSON = () => {
    const file = fileInput.value.files[0]
    if (!file) {
        alert("Please select an XML file.")
        return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
        const xmlContent = event.target.result
        const parser = new DOMParser()
        const xmlDoc = parser.parseFromString(xmlContent, "application/xml")

        const parseError = xmlDoc.querySelector('parsererror')
        if (parseError) {
            outputText.value = 'Error: Invalid XML file'
            return
        }

        const items = xmlDoc.querySelectorAll('item')
        const wordList = []

        items.forEach(item => {
            const wordElement = item.querySelector('word')
            const transElement = item.querySelector('trans')
            
            if (wordElement && transElement) {
                const word = wordElement.textContent.trim()
                const trans = transElement.textContent.trim()
                
                // 解析翻译文本，按分号分割多个释义，并处理特殊字符
                const translations = trans.split('；')
                    .map(t => t.trim().replace(/\n/g, ''))
                    .filter(t => t.length > 0)
                    .slice(0, 3) // 只保留前3个翻译
                
                wordList.push({
                    name: word,
                    trans: translations
                })
            }
        })

        if (wordList.length === 0) {
            outputText.value = 'No words found in the XML file'
            return
        }

        // Update output text with formatted JSON
        outputText.value = JSON.stringify(wordList, null, 2)

        // Create downloadable JSON file
        const jsonContent = JSON.stringify(wordList, null, 2)
        const blob = new Blob([jsonContent], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'words.json'
        a.click()
        URL.revokeObjectURL(url)
    }

    reader.readAsText(file)
}
</script>

<style scoped>
/* Use VitePress theme variables */
.xml-converter-container {
    background: var(--vp-c-bg-soft);
    border-radius: 16px;
    padding: 2.5rem;
    width: 100%;
    max-width: 800px;
    margin: 2rem auto;
    box-shadow: var(--vp-shadow-3);
    border: 1px solid var(--vp-c-divider);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.xml-converter-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 5px;
    background: linear-gradient(90deg, var(--vp-c-brand-1), var(--vp-c-green-1));
}

.xml-converter-container:hover {
    /* transform: translateY(-3px); */
    box-shadow: var(--vp-shadow-4);
}

.title {
    font-size: 2rem;
    margin-bottom: 2rem;
    color: var(--vp-c-brand-1);
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    font-weight: 700;
}

.title i {
    font-size: 1.75rem;
    color: var(--vp-c-brand-1);
}

.file-input-wrapper {
    position: relative;
    margin-bottom: 2rem;
}

.file-input {
    display: none;
}

.file-input-label {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 1.5rem;
    background-color: var(--vp-c-bg-alt);
    color: var(--vp-c-text-1);
    border: 2px dashed var(--vp-c-brand-3, var(--vp-c-brand-1));
    border-radius: 12px;
    cursor: pointer;
    text-align: center;
    font-weight: 600;
    transition: all 0.3s ease;
    gap: 0.75rem;
}

.file-input-label i {
    font-size: 1.5rem;
    transition: transform 0.3s ease;
}

.file-input-label:hover {
    background-color: var(--vp-c-bg-soft);
    border-color: var(--vp-c-brand-1);
    color: var(--vp-c-brand-1);
    transform: translateY(-2px);
    box-shadow: var(--vp-shadow-2);
}

.file-input-label:hover i {
    transform: translateY(-3px);
}

.file-input-label:active {
    transform: translateY(0);
}

.file-name {
    margin-top: 1rem;
    color: var(--vp-c-text-2);
    font-size: 0.95rem;
    text-align: center;
    padding: 0.5rem;
    background-color: var(--vp-c-bg-alt);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

.button-group {
    display: flex;
    justify-content: center;
    gap: 1.5rem;
    margin: 2rem auto;
}

.convert-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    min-width: 180px;
    background-color: var(--vp-button-brand-bg, var(--vp-c-brand-1));
    color: var(--vp-button-brand-text, white);
    border: none;
    padding: 1rem 1.5rem;
    border-radius: 30px;
    cursor: pointer;
    font-weight: 600;
    font-size: 1rem;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.convert-btn::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.1);
    transform: translateX(-100%);
    transition: transform 0.3s ease;
}

.convert-btn:hover::after {
    transform: translateX(0);
}

.json-btn {
    background-color: var(--vp-c-green-1, #10b981);
}

.json-btn:hover {
    background-color: var(--vp-c-green-2, #059669);
}

.convert-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.convert-btn:active {
    transform: translateY(-1px);
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
}

.convert-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}

.output-container {
    margin-top: 1.5rem;
    height: 350px;
    overflow-y: auto;
    background-color: var(--vp-code-block-bg, var(--vp-c-bg-soft));
    border-radius: 12px;
    border: 1px solid var(--vp-c-divider);
    scrollbar-width: thin;
    scrollbar-color: var(--vp-c-brand-1) var(--vp-c-bg-soft);
    transition: all 0.3s ease;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
}

.output-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid var(--vp-c-divider);
    background-color: var(--vp-c-bg-alt);
    font-weight: 600;
    color: var(--vp-c-text-1);
}

.output-actions {
    display: flex;
    gap: 0.5rem;
}

.action-btn {
    background: transparent;
    border: none;
    color: var(--vp-c-text-2);
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 4px;
    transition: all 0.2s ease;
}

.action-btn:hover {
    color: var(--vp-c-brand-1);
    background-color: var(--vp-c-bg-soft);
}

.output-container::-webkit-scrollbar {
    width: 8px;
}

.output-container::-webkit-scrollbar-track {
    background: var(--vp-c-bg-soft);
    border-radius: 4px;
}

.output-container::-webkit-scrollbar-thumb {
    background: var(--vp-c-brand-1);
    border-radius: 4px;
}

.output-container::-webkit-scrollbar-thumb:hover {
    background: var(--vp-c-brand-2);
}

.output-container pre {
    font-family: var(--vp-font-family-mono, monospace);
    white-space: pre-wrap;
    word-break: break-all;
    color: var(--vp-c-text-1);
    margin: 0;
    font-size: 0.95rem;
    line-height: 1.6;
    padding: 1.5rem;
}

/* Responsive adjustments */
@media (max-width: 640px) {
    .xml-converter-container {
        padding: 1.5rem;
        max-width: 100%;
        border-radius: 12px;
    }
    
    .title {
        font-size: 1.5rem;
        margin-bottom: 1.5rem;
    }
    
    .file-input-label {
        padding: 1rem;
    }
    
    .button-group {
        flex-direction: column;
        align-items: center;
        gap: 1rem;
    }
    
    .convert-btn {
        padding: 0.75rem 1.25rem;
        width: 100%;
        max-width: 220px;
    }
    
    .output-container {
        height: 300px;
    }
    
    .output-container pre {
        padding: 1rem;
        font-size: 0.85rem;
    }
}
</style>