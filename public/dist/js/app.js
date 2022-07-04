//it's working!
const pageTitle = $q('.page-title');
pageTitle.textContent = 'IPA!';
console.log(`${pageTitle.textContent}`);

//app.js
const areaWords = $q('.words');
const areaTranslation = $q('.translation');
const btnSearch = $q('.btn-search');
const alerts = $q('.alerts');
const labelWordsAreas = $q('.label-words-area');
const btnClean = $q('.btn-clean');
const defaultAreaHeight = 4;
const wordHeight = 1.4;
const maximunEnters = 10;

const nothingToTranslate = `
  <div class="container-fluid">
    <div class="alert alert-danger alert-dismissible fade show">
      <button type="button" class="btn-close btn-nothing-to-translate" data-bs-dismiss="alert"></button>
      <strong>Alert:</strong> There is nothing to translate
    </div>
  </div>
  `;

const setHeightArea = ({ height, translationFlag }) => {
  areaWords.style.height = height;
  if (translationFlag) {
    areaTranslation.style.height = height;
  }
};

const counterEnter = (text) => {
  return text.split('\n').length - 1;
};

const updateAreaHeight = ({ translationFlag }) => {
  let enters = counterEnter(areaWords.value);
  if (enters < maximunEnters) {
    setHeightArea({
      height: defaultAreaHeight + wordHeight * enters + 'rem',
      translationFlag,
    });
    labelWordsAreas.style.display = 'block';
  } else {
    labelWordsAreas.style.display = 'none';
  }
};

const splitter = (text) => {
  //TEST
  /*
  Hello     how
     are
  you
  */

  text = text.trim();
  text = text.toLowerCase();
  //replace all spaces for one space
  text = text.replace(/\s+/g, ' ');
  text = text.replaceAll(' ', '\n');
  text = text.split('\n');
  return text;
};

const findIPA = (json) => {
  if (json !== undefined) {
    for (let i = 0; i < json.phonetics.length; i++) {
      if (json.phonetics[i].audio.endsWith('uk.mp3')) {
        // console.log(json.phonetics[i].audio);
        return json.phonetics[i].text;
      }
    }
  }
  return null;
};

const useAPI = ({ word, isLastOne }) => {
  areaTranslation.value = '';
  let notExistEnglandVersion = true;
  let notExistNoneVersion = true;
  let url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
  fetch(url)
    .then((response) => response.json())
    .then((json) => {
      for (let i = 0; i < json.length; i++) {
        let IPA = findIPA(json[i]);
        if (IPA !== null) {
          areaTranslation.value += IPA !== null ? `${word} -> ${IPA}` : 'error!';
          areaTranslation.value += isLastOne === true ? '\n' : '';
          // console.log(IPA);
          notExistEnglandVersion = false;
          break;
        }
      }
      for (let i = 0; i < json.length; i++) {
        if (notExistEnglandVersion && json[i].phonetic) {
          areaTranslation.value += `${word} -> ${json[i].phonetic}`;
          areaTranslation.value += isLastOne === true ? '\n' : '';
          notExistNoneVersion = false;
          break;
        }
      }
      if (notExistEnglandVersion && notExistNoneVersion) {
        areaTranslation.value += `${word} -> not found`;
        areaTranslation.value += isLastOne === true ? '\n' : '';
      }
    });
};

const useArrayApi = () => {
  let words = splitter(areaWords.value);
  let isLastOne = true;
  words.forEach((word, index) => {
    console.log(word);
    if (index === words.length - 1) {
      isLastOne = false;
    }
    useAPI({ word, isLastOne });
  });
};

const setWordByWord = () => {
  let words = splitter(areaWords.value);
  areaWords.value = '';
  words.forEach((word, index) => {
    areaWords.value += word;

    if (index !== words.length - 1) {
      areaWords.value += '\n';
    }
  });

  updateAreaHeight({ translationFlag: true });
};

// the magic starts from here
setHeightArea({ height: defaultAreaHeight + 'rem' });

areaWords.addEventListener('keyup', () => {
  updateAreaHeight({ translationFlag: false });
});
areaWords.addEventListener('keydown', () => {
  updateAreaHeight({ translationFlag: false });
});

btnSearch.addEventListener('click', (e) => {
  if (areaWords.value.length === 0) {
    alerts.innerHTML += nothingToTranslate;
    areaTranslation.value = '';
  } else {
    setWordByWord();
    useArrayApi();
  }
});

btnClean.addEventListener('click', () => {
  areaWords.value = '';
  areaTranslation.value = '';
});
