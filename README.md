# text-duplicates-detector [![codecov](https://codecov.io/gh/viebel/text-duplicates-detector/branch/master/graph/badge.svg)](https://codecov.io/gh/viebel/text-duplicates-detector) 
Detects duplication in text


# In a nutshell

Our purpose is to be able to count the number of unique occurences of a phrase in a corpus. The challenge is to be able to define what we mean exactly by **unique**. 

This module provides a set of functions that detects whether occurences of a phrase in some texts are duplicate. By duplicate, we mean similar texts up to irrelevant modifications.

For instance, if we look at two pieces of text:


>After a long **period** of inactivity, an intersting **opportunity** for IBM occurred last week.

>The last **period** was not exciting due to the negociations that lead nowhere, until an intersting **opportunity** for IBM occurred last week.

In the nighborhood of **period**, the texts are not similar while in the neighborhood of **opportunity**, the texts are similar.

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
const signature = require('@harmon.ie/duplicate-text-detector');

const text1 = `Dave,

See ticket #50366

Why do we issue this

Ron

Ron Smith
VP, Product Solutions
acme.com<http://acme.com/>
714.949.3001, rons@acme.com`;
  
const from = { email: 'rons@acme.com', displayName: 'Ron Smith' };
const ret = signature.getSignature(body,from);

```
### Browser 

TBD

##	API Reference

### getSignature(body,from,bodyNoSig)
returns - { signature: the signature text, bodyNoSig: see optional bodyNoSig parameter below }
body - contains the email body text 
from - optional: contains email and displayName used to detect the sender name in the signature. (see example in Usage)
bodyNoSig - optional: if true and the signature is found, the return object includes bodyNoSig : the email text until the beginning of the signature. 

### removeSignature(body,from)
returns - the email text until the beginning of the signature
body - contains the email body text 
from - optional: contains email and displayName used to detect the sender name in the signature. (see example in Usage)

 
## Limitations and known issues

### Limitations

- Only the english language is supported.
- This library is intented to be used in the context of entreprise emails. It was not tested with personal emails. It does, however detects simple personal signatures, such as Thanks\n<Sender Name> or only <Sender Name>
- This library doesn't detect some signatures that may appear in automated emails (non personal signatures). 
- Some material that appear at the end of an email, and is very similar to signatures, may be detected as signature. For instance, online meeting details (containing phone numbers, urls, emails) 

### Known issues

- When a signature contains several long lines, such as job title, address or legal disclaimer, it might cause the signature not to be detected. The reason is that the algorithm penalizes long lines in signatures. The algorithms still detects many sigantures that contains long lines and we believe (and hope) that large number of long lines is not very common.
- Forwarded email thread with several messages and several signatures: the signatures are not detected in this case.


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
