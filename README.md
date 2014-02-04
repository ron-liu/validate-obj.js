## What is validate-obj? ##
**validate-obj** is a javascript validation library, esp. for validate object.
**validate-obj** both work for node.js server-side and front-end.

## Why I create validate-obj? ##
I started this project just because I want to use validation in my own project and I cannot find one suit my needs. I saw lots of javascript validation libraries, but actually there are validators. They are very easy to end up code like the following:
```javascript
var validator = require('validator');
var myUserForm = {
	name: 'John',
	createdOn: '10/12/1987',
	age: 27,
	gender: 'male',
	email: 'Jonh@emailDomain.com'
};

//Start validator
var errs = [],
if (!validator.isEmail(myUserForm.email)) {
	errs.push('email is invalid');
}

if (!validator.isString(myUserForm.name)) {
	errs.push('name is invalid');
}

if (!validator.isIn(myUserForm.gender, ['male', 'female']) {
	errs.push('gender is invalid');
}

//...
```
**Are you tired of the above? How about we just simply do the following?**

 ```javascript
 var v = require('validate-obj');
 var errs = v.validateObj(myUserForm, {
    name: [v.required, v.isString],
    createdOn: [v.isDate],
    age: [v.isNumber],
    gender: [v.enums(['male', 'female'])],
    email: [v.isEmail]
 });
 ```

## How to install? ##
 **For node.js**
 ```bash
 npm install validate-obj
 ```

 **For front end (coming soon)**
 ```bash
 bower install validate-obj
 ```

## Progress? ##
 Currently, it just support simple object and only has limited validators. My future plan is as below:
 * Support more validators;
 * Support extend custom validators;
 * Support complex nested object, like nested array or object.
