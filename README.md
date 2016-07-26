## What is validate-obj?
**validate-obj** is a javascript validation framework, easy to validate object or form, and is very easy to extend.
**validate-obj** mainly for node.js server-side, but also work for front-end.

[![Build Status](https://travis-ci.org/ron-liu/validate-obj.js.png?branch=master)](https://travis-ci.org/ron-liu/validate-obj.js)

## Why I create validate-obj?
I started this project just because I cannot find existing one fits my requirements. There are many other validation projects, but many of them is very easy to end up code like the following:
```javascript
var validator = require('validator');
var myUserForm = {
	name: 'John', // required, string
	email: 'Jonh@emailDomain.com', // required, email
	age: 27, // int
	gender: 'male', // male or female
	createdOn: '10/12/1987'
};

//Start validating
var errs = [],
if (typeof myUserForm.name === undefined) {
	errs.push('name is required');
}
else if (!validator.isString(myUserForm.name)) {
	errs.push('name must be a string');
}

if (typeof myUserForm.email === undefined) {
	errs.push('email is required');
} else if (myUserForm.email !== undefined && !validator.isEmail(myUserForm.email)) {
	errs.push('email is invalid');
}

if (typeof myUserForm.age !== undefined && !validator.isNumber(myUserForm.age) {
	errs.push('age is invalid');
}

if (typeof myUserForm.gender !== undefined && !validator.isIn(myUserForm.gender, ['male', 'female']) {
	errs.push('gender is invalid');
}
```

**Are you tired of the above? How about we just simply do the following?**
```javascript
var v = require('validate-obj');
var myUserForm = {
	name: 'John', // required, string
	email: 'Jonh@emailDomain.com', // required, email
	age: 27, // int
	gender: 'male', // male or female
	createdOn: '10/12/1987'
};
var validationExpression = {
   name: [v.required, v.isString],
   email: [v.required, v.isEmail],
   age: v.isNumber,
   gender: v.isIn(['male', 'female']),
   createdOn: v.isDate
};

var errs = v.hasErrors(myUserForm, validationExpression);
```
**It is beautiful, isn't it? and even we save this validation sytax object and reuse it.**

## How to install?
 **For node.js**
 ```bash
 npm install validate-obj
 ```

 **For front end (coming soon)**
 ```bash
 bower install validate-obj
 ```

## APIs

### Overview
``` javascript
var v = require('validate-obj'); //load the library, to make it short, I will not include it in the following examples

// target: the object going to be validated
// validationExpression: the validation defination indicating how to validate
// return value: null means no errors or array of error string
v.hasErrors(target, validationExpression)
```
	
### To validate simple variables
``` javascript
v.hasErrors(1, v.isNumber) // ==> null
v.hasErrors('a', v.isNumber) // ==> ['it is not number']
v.hasErrors('male', v.isIn(['male', 'female'])) // ==> null
v.hasErrors('middle', v.isIn(['male', 'female'])) // ==> ['it must be one of (male, female)']
```

### To override the error message
``` javascript
v.hasErrors('a', v.isNumber('age should be a number')) // ==> ['age should be a number']
v.hasErrors('middle', v.isIn(['male', 'female'], 'gender has to be male or female')) // ==> ['gender has to be male or female']
v.hasErrors('middle', v.isIn('gender has to be male or female', ['male', 'female'])) // ==> ['gender has to be male or female']
```

### Validate with multiple validators
``` javascript
v.hasErrors('a', [v.required, v.isString])) // ==> null
v.hasErrors(undefined, [v.isRequired, v.isNumber]) // ==> ['it is required']
```

### To validate array
``` javascript
v.hasErrors('a', [[v.isString]]) // ==> it is not array
v.hasErrors(['a', 'b'], [[v.isString]]) // ==> null
```

### To validate object
``` javascript
v.hasErrors({name: 'john', age: 27}, {name: v.isString, age: v.isNumber}) // ==> null
v.hasErrors({name: 'john', age: '27'}, {name: v.isString, age: v.isNumber}) // ==> ['it.age is not number']
```

### To validate complex object
``` javascript
v.hasErrors(
	{
		name: 'john', 
		orderNumber: 12345, 
		items: [{sku: 222, quantity: 2}]
	},
	{
		name: v.isString, 
		orderNumber: v.isNumber, 
		items: [{ sku: v.isNumber, quantity: v.isNumber}]
	}) // ==> null
	
v.hasErrors(
	{
		name: 'john', 
		orderNumber: 12345, 
		items: [{sku: '123', quantity: 2}]
	},
	{
		name: v.isString, 
		orderNumber: v.isNumber, 
		items: [{ sku: v.isNumber, quantity: v.isNumber}]
	}) // ==> ['it.items[0].sku is not number']
```

### Validate logic which have multiple properties involved
``` javascript
	var schema = {
		password: [v.isString, v.required],
		matchedPassword: [v.isString, v.required],
		selfCrossValidators : function(obj) {
			if (obj.password !== obj.matchedPassword) return 'passwords do not match';
			return undefined;
		}
	};
	v.hasErrors({password:'123', matchedPassword: '123'}, schema) // => null
	v.hasErrors({password:'123', matchedPassword: 'a23'}, schema) // => ['passwords do not match']

	// The selfCrossValidators can also be array like the below
	var schema = {
        password: [v.isString, v.required],
        matchedPassword: [v.isString, v.required],
        selfCrossValidators : [function(obj) {
            if (obj.password !== obj.matchedPassword) return 'passwords do not match';
            return undefined;
        }]
    };
```

### Extend your custom validators
* With auto error message

``` javascript
v.register('isGender', 
	function(value) {
		return value ==='male' || value ==='female'
	}
);
v.hasErrors('male', v.isGender) // ==> null
v.hasErrors('middle', v.isGender) // ==> ['it is invalid']
```

* With error message

``` javascript
v.register('isGender', v.build(
	function(value) {
		return value ==='male' || value ==='female';
	},
	function(name) {
		return  name + ' is not gender'
	}
));
v.hasErrors('male', v.isGender); // ==> null
v.hasErrors('middle', v.isGender) // ==> ['it is not gender']
```

### Built-in validators
* required
* isDate
* isBool
* isString
* isNumber
* isEmail
* isCreditCard
* isIn
* minLength
* maxLength
* isUrl
* isBefore
* isAfter
* isObject

## Progress
The whole framework is done, the only missing is not enough built-in validators. I will add more soon. 
