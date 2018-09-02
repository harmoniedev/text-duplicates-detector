# text-duplicates-detector [![codecov](https://codecov.io/gh/harmoniedev/text-duplicates-detector/branch/development/graph/badge.svg)](https://codecov.io/gh/harmoniedev/text-duplicates-detector) 
Detects duplication in text


# In a nutshell

Our purpose is to be able to count the number of unique occurences of a phrase in a corpus. The challenge is to be able to define what we mean exactly by **unique**. 

This module provides a set of functions that detects whether occurences of a phrase in some texts are duplicate. By duplicate, we mean similar texts up to irrelevant modifications.

For instance, if we look at two pieces of text:


>After a long **period** of inactivity, an intersting **opportunity** for IBM occurred last week.

>The last **period** was not exciting due to the negociations that lead nowhere, until an interesting **opportunity** for IBM occurred last week.

In the neighborhood of **period**, the texts are not similar while in the neighborhood of **opportunity**, the texts are similar.

We say that the occurences of **period** are not duplicate while the occurrences of **opportunity** are duplicate.


# Usage 

### Node 

Install: 

```bash
npm install @harmon.ie/duplicate-text-detector
```

or 

```bash
yarn add @harmon.ie/duplicate-text-detector
```



```js
const dup = require('@harmon.ie/duplicate-text-detector');

const text1 = `After a long period of inactivity, an intersting opportunity for IBM occurred last week.`;
const text2 = `The last period was not exciting due to the negociations that lead nowhere, until an intersting opportunity for Google occurred last week.`;

dup.isDuplicate(text1, text2, 'period'); // returns false
dup.isDuplicate(text1, text2, 'opportunity'); // returns true
```

### Browser 

TBD

##	API Reference


## Limitations and known issues

### Limitations

- Only the english language is supported.


### Known issues

- Only the first instance of the phrase in the texts are taken into account.

## How does it work ?

The algorithm smartly compares left and right neigborhoods of the texts if either the left neighborhoods or the right neighborhoods are similar then we consider the texts are duplicate.

More formally, we decompose two occurrences of *<PHRASE>* in two texts *<TEXT_A>* and *<TEXT_B>* in:

```
<LEFT_A> <PHRASE> <RIGHT_A> 
and 
<LEFT_B> <PHRASE> <RIGHT_B>
```

If either:

- *<LEFT_A>* is similar to *<LEFT_B>* or
- *<RIGHT_A>* is similar to *<RIGHT_B>*

then *<TEXT_A>* and *<TEXT_B>* are duplicate occurrences of *<PHRASE>*.


Two neigborhoods are similar if the ratio between the number of different characters and the total number of characters is below 0.3 (configurable). 

We rely of [fast-diff](https://www.npmjs.com/package/fast-diff) module to count the number of different characters.

## Roadmap and Contributions
