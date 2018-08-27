# text-duplicates-detector [![codecov](https://codecov.io/gh/harmoniedev/text-duplicates-detector/branch/development/graph/badge.svg)](https://codecov.io/gh/harmoniedev/text-duplicates-detector) 
Detects duplication in text


# In a nutshell

Our purpose is to be able to count the number of unique occurences of a phrase in a corpus. The challenge is to be able to define what we mean exactly by **unique**. 

This module provides a set of functions that detects whether occurences of a phrase in some texts are duplicate. By duplicate, we mean similar texts up to irrelevant modifications.

For instance, if we look at two pieces of text:


>After a long **period** of inactivity, an intersting **opportunity** for IBM occurred last week.

>The last **period** was not exciting due to the negociations that lead nowhere, until an intersting **opportunity** for Google occurred last week.

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

The library implements a simple algorithm to detect lines that are candidate for being the start of a signature, and score each candidate by examining the lines following the start.

Example of trigger candidates:

- name of the email sender
- words such as `Thanks` and `Regards`

The score of each candidate is determined by the likelihood of the following lines to be part of the signature. Each of the lines that follow a trigger candidiate is given a score that relates to this likelihood.

Example of lines with high score:

- phone number
- email address
- url
- sender name.

Also, we implement some heuristics, for instance:
- long lines should not appear too much in signature
- signatures should not have too many lines

Note: The detectors of phone numbers, email addresses and urls are simple and their purpose is to support the signature scoring. They shouldn't be used standalone. Please refer to a specialized detector and validation libraries for that.      

## Roadmap and Contributions
