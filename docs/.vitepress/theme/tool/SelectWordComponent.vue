<template>
  <div class="word-editor-container">
    <h1>Vocabulary Editor</h1>

    <div class="upload-section">
      <label for="file-input" class="upload-label">
        Click here to upload your JSON Vocabulary
      </label>
      <input type="file" id="file-input" @change="handleFileSelect" accept=".json" ref="fileInput" />
      <p v-if="originalFilename" class="file-name-display">
        Loaded: {{ originalFilename }}
      </p>
    </div>

    <div v-if="vocabulary.length > 0" class="list-controls-container">
      <div class="controls">
        <div class="select-all-container">
          <input type="checkbox" id="select-all" v-model="selectAll" />
          <label for="select-all">Select All</label>
        </div>
        <button @click="bulkDelete" class="btn btn-danger">Delete Selected</button>
        <button @click="exportWords" class="btn btn-success">Export Remaining</button>
      </div>

      <ul class="word-list">
        <li v-for="word in vocabulary" :key="word.id" class="word-item">
          <div class="word-content">
            <input type="checkbox" class="word-checkbox" v-model="word.selected" />
            <div class="text-content">
              <span class="word-name">{{ word.name }}</span>
              <span class="word-trans">{{ truncate(word.trans[0], 35) }}</span>
            </div>
          </div>
          <button @click="deleteWord(word.id)" class="delete-btn" title="Delete this word">
            DELETE
          </button>
        </li>
      </ul>
    </div>

    <div v-else-if="didUpload" class="empty-state">
      The vocabulary list is empty.
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// --- Reactive State ---
const vocabulary = ref([]);
const originalFilename = ref('');
const didUpload = ref(false); // To track if a file has been processed

// --- Methods ---

const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  originalFilename.value = file.name;
  didUpload.value = true;
  event.target.value = ''; // Reset file input to allow re-uploading the same file

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const content = JSON.parse(e.target.result);
      vocabulary.value = content.map((word, index) => ({
        ...word,
        id: `word-${Date.now()}-${index}`,
        selected: false,
      }));
    } catch (error) {
      alert(`Error parsing JSON file. Please ensure it is correctly formatted.\nDetails: ${error.message}`);
      resetState();
    }
  };
  reader.readAsText(file);
};

const deleteWord = (wordId) => {
  vocabulary.value = vocabulary.value.filter(word => word.id !== wordId);
};

const bulkDelete = () => {
  vocabulary.value = vocabulary.value.filter(word => !word.selected);
};

const exportWords = () => {
  if (vocabulary.value.length === 0) {
    alert('There are no words to export.');
    return;
  }

  const dataToExport = vocabulary.value.map(({ name, trans }) => ({ name, trans }));
  const jsonString = JSON.stringify(dataToExport, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });

  const nameParts = originalFilename.value.split('.');
  const extension = nameParts.pop() || 'json';
  const newFilename = `${nameParts.join('.') || 'vocabulary'}_selected.${extension}`;

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = newFilename;
  link.click();
  URL.revokeObjectURL(link.href);
};

const truncate = (text, length = 10) => {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
}

const resetState = () => {
  vocabulary.value = [];
  originalFilename.value = '';
  didUpload.value = false;
};

// --- Computed Property for "Select All" Checkbox ---
const selectAll = computed({
  get: () => vocabulary.value.length > 0 && vocabulary.value.every(word => word.selected),
  set: (value) => {
    vocabulary.value.forEach(word => {
      word.selected = value;
    });
  }
});
</script>

<style scoped>

input[type="checkbox"]{
  position: relative;
  margin-left: 0px;
}

/* --- Main Container Layout (NEW) --- */
.word-editor-container {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #fff;
  padding: 20px 30px 30px 30px;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  max-width: 900px; /* Centering element */
  margin: 40px auto; /* Centering element */
}

h1 {
  text-align: center;
  color: #333;
  margin-top: 10px;
  margin-bottom: 25px;
  font-size: 2em;
  font-weight: 600;
}

/* --- Upload Section --- */
.upload-section {
  border: 2px dashed #ccc;
  padding: 30px;
  text-align: center;
  border-radius: 8px;
  margin-bottom: 30px;
  background-color: #f8f9fa;
}
#file-input {
  display: none;
}
.upload-label {
  cursor: pointer;
  color: #007bff;
  font-weight: bold;
  font-size: 1.1em;
}

.file-name-display {
  margin-top: 15px;
  color: #555;
}

/* --- Controls --- */
.controls {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 20px;
}
.select-all-container {
  display: flex;
  align-items: center;
  margin-right: auto;
}
#select-all {
  margin-right: 8px;
  transform: scale(1.2);
}
.btn {
  padding: 10px 18px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}
.btn-danger { background-color: #dc3545; color: white; }
.btn-danger:hover { background-color: #c82333; }
.btn-success { background-color: #28a745; color: white; }
.btn-success:hover { background-color: #218838; }


/* --- Word List --- */
.word-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.word-item {
  display: flex;
  align-items: stretch;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  margin-bottom: 10px;
  overflow: hidden;
  transition: box-shadow 0.2s;
}
.word-item:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.word-content {
  flex: 2;
  display: flex;
  align-items: center;
  padding: 12px 15px; /* Reduced padding for a more compact look */
  min-width: 0; /* Prevents flex item from overflowing */
}
.word-checkbox {
  margin-right: 20px;
  flex-shrink: 0;
  transform: scale(1.2);
}

/* --- Single Line Word/Trans Display (NEW) --- */
.text-content {
  display: flex;
  align-items: baseline; /* Aligns text of different sizes nicely */
  white-space: nowrap; /* Prevents wrapping */
  overflow: hidden; /* Hides overflow */
  text-overflow: ellipsis; /* Adds "..." for overflow */
}
.word-name {
  font-weight: bold;
  font-size: 1.2em;
  color: #212529;
  flex-shrink: 0; /* Prevents word from shrinking */
}
.word-trans {
  font-size: 0.9em;
  margin-left: 15px; /* Space between word and translation */
  overflow: hidden;
  text-overflow: ellipsis;
}

/* --- BIG DELETE BUTTON --- */
.delete-btn {
  flex: 1;
  background-color: #fbebee;
  color: #c82333;
  border: none;
  cursor: pointer;
  font-size: 1em;
  font-weight: bold;
  letter-spacing: 1px;
  transition: all 0.2s;
  border-left: 1px solid #e9ecef;
}
.delete-btn:hover {
  background-color: #dc3545;
  color: white;
}

.empty-state {
  text-align: center;
  color: #888;
  font-size: 1.1em;
  padding: 40px;
}
</style>