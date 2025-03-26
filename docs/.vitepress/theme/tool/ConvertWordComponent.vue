<template>
    <div class="xml-converter-container">
        <div class="title">
            <i class="fas fa-file-code"></i>
            XML Converter
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
                Select XML File
            </label>
            <div class="file-name" v-if="fileName">
                {{ fileName }}
            </div>
        </div>

        <button
                class="convert-btn"
                @click="convertXMLToTXT"
                :disabled="!fileName"
        >
            Convert to Text
        </button>

        <div class="output-container">
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
</script>

<style scoped>
/* Use VitePress theme variables */
.xml-converter-container {
    background: var(--vp-c-bg-soft);
    border-radius: 12px;
    padding: 2rem;
    width: 100%;
    max-width: 800px;
    margin: 2rem auto;
    box-shadow: var(--vp-shadow-2);
    border: 1px solid var(--vp-c-divider);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.xml-converter-container:hover {
    transform: translateY(-2px);
    box-shadow: var(--vp-shadow-3);
}

.title {
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
    color: var(--vp-c-brand-1);
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
}

.title i {
    font-size: 1.5rem;
    color: var(--vp-c-brand-1);
}

.file-input-wrapper {
    position: relative;
    margin-bottom: 1.5rem;
}

.file-input {
    display: none;
}

.file-input-label {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 1.25rem;
    background-color: var(--vp-c-bg-alt);
    color: var(--vp-c-text-1);
    border: 2px dashed var(--vp-c-brand-3, var(--vp-c-brand-1));
    border-radius: 12px;
    cursor: pointer;
    text-align: center;
    font-weight: 600;
    transition: all 0.3s ease;
    gap: 0.5rem;
}

.file-input-label:hover {
    background-color: var(--vp-c-bg-soft);
    border-color: var(--vp-c-brand-1);
    color: var(--vp-c-brand-1);
    transform: translateY(-2px);
    box-shadow: var(--vp-shadow-2);
}

.file-input-label:active {
    transform: translateY(0);
}

.file-name {
    margin-top: 0.625rem;
    color: var(--vp-c-text-2);
    font-size: 0.875rem;
    text-align: center;
}

.convert-btn {
    display: block;
    margin: 1.5rem auto;
    max-width: 300px;
    background-color: var(--vp-button-brand-bg, var(--vp-c-brand-1));
    color: var(--vp-button-brand-text, white);
    border: 1px solid var(--vp-button-brand-border, transparent);
    padding: 1rem 2rem;
    border-radius: 24px;
    cursor: pointer;
    font-weight: 600;
    font-size: 1rem;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.convert-btn:hover {
    background-color: var(--vp-button-brand-hover-bg, var(--vp-c-brand-2));
    transform: translateY(-2px);
    box-shadow: var(--vp-shadow-2);
}

.convert-btn:active {
    transform: translateY(0);
}

.convert-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}

.output-container {
    margin-top: 1.5rem;
    height: 300px;
    overflow-y: auto;
    background-color: var(--vp-code-block-bg, var(--vp-c-bg-soft));
    border-radius: 12px;
    padding: 1.5rem;
    border: 1px solid var(--vp-c-divider);
    scrollbar-width: thin;
    scrollbar-color: var(--vp-c-brand-1) var(--vp-c-bg-soft);
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
    font-size: 0.875rem;
    line-height: 1.5;
}
/* Responsive adjustments */
@media (max-width: 640px) {
    .xml-converter-container {
        padding: 1.25rem;
        max-width: 100%;
    }
    
    .title {
        font-size: 1.5rem;
        margin-bottom: 1rem;
    }
    
    .file-input-label {
        padding: 0.75rem;
    }
    
    .convert-btn {
        padding: 0.625rem 1rem;
    }
    
    .output-container {
        padding: 1rem;
    }
}
</style>