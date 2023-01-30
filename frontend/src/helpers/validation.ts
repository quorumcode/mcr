export type Error = string;
export type ValidateFunction<V> = (value: V) => Error | Error[] | undefined;

export class Validator<V> {
  public name = "";
  public stopped = false;
  readonly validateCallback;

  constructor(validateCallback: ValidateFunction<V>, name = "") {
    this.validateCallback = validateCallback;
    this.name = name;
  }

  stop(): Validator<V> {
    this.stopped = true;
    return this;
  }

  validate(value: V): Error | Error[] | undefined {
    return this.validateCallback(value);
  }
}

export function combineValidators<V>(
  ...validators: Validator<V>[]
): Validator<V> {
  const names = validators.map(({ name }) => name);
  return new Validator<V>((value) => {
    let errors = [] as string[];
    for (const validator of validators) {
      const errorsResult = validator.validate(value);
      if (!errorsResult) {
        continue;
      }
      errors = errors.concat(errorsResult);
      if (validator.stopped) {
        break;
      }
    }
    return errors;
  }, `Combined from ${names.join(", ")}`);
}

export function getRequiredValidator(
  errorMessage = `Please provide a valid value`
): Validator<string | number | string[]> {
  return new Validator((value) => {
    if (!value) {
      return errorMessage;
    }
    if (Array.isArray(value) && !value.length) {
      return errorMessage;
    }
  }, "Required").stop();
}

export function getPatternValidator(): Validator<string> {
  return new Validator((value) => {
    if (/[^a-zA-Z0-9\-\\.,' ]/.test(value)) {
      return "May include numbers, letters, and punctuation only";
    }
  }, "Pattern");
}

export function getLengthValidator({
  maxChars = 0,
  minChars = 0,
  formName = "",
}: {
  maxChars?: number;
  minChars?: number;
  formName?: string;
}): Validator<string> {
  return new Validator((value) => {
    if (value.length > maxChars && formName === "contactForm") {
      return `Sorry, the message must be under ${maxChars} characters`;
    }
    if (value.length > maxChars) {
      return `Must be under ${maxChars} characters`;
    }
    if (value.length < minChars) {
      return `Must be at least ${minChars} characters long`;
    }
  }, "Length");
}

export function getPasswordValidator(): Validator<string> {
  return getLengthValidator({ minChars: 8, maxChars: 128 });
}

export function getEmailValidator(): Validator<string> {
  return combineValidators<string>(
    getLengthValidator({ maxChars: 128 }),
    new Validator((value) => {
      if (value === "") {
        return;
      }
      // https://stackoverflow.com/a/9204568
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return "Please provide a valid email";
      }
    }, "EmailPattern")
  );
}

export function getCreditCardNumberValidator(): Validator<string> {
  return new Validator((value) => {
    if (!value) {
      return;
    }
    if (
      !/^(?:4[0-9]{12}(?:[0-9]{3})?|[25][1-7][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/.test(
        value
      )
    ) {
      return "Please provide a valid card number";
    }
  }, "CreditCardNumber");
}

export function getCreditCardDateValidator(): Validator<string> {
  return new Validator((value) => {
    if (!value) {
      return;
    }
    if (!/^\d{4}$/.test(value)) {
      return "Invalid expiry date";
    }
    const month = parseInt(value.slice(0, 2));
    const year = parseInt(value.slice(2, 4));

    const nowDate = new Date();
    const nowYear = nowDate.getFullYear().toString().slice(2, 4);
    const nowMonth = nowDate.getMonth() + 1;

    if (+nowYear > year) {
      return "Invalid expiry date (year)";
    }

    if (+nowYear === year && nowMonth > month) {
      return "Invalid expiry date (month)";
    }

    if (!month || month > 12 || !year) {
      return "Invalid expiry date";
    }
  }, "CreditCardDate");
}

export function getCreditCardCvvValidator(): Validator<string> {
  return new Validator((value) => {
    if (!value) {
      return;
    }
    if (!/^\d{3,4}$/.test(value)) {
      return "Invalid cvv";
    }
  }, "CreditCardCvv");
}

export function getWebsiteValidator(): Validator<string> {
  return new Validator((value) => {
    if (!value) {
      return;
    }
    if (!/.*\..*/.test(value)) {
      return "Invalid website url";
    }
  }, "Website");
}

export function getWhitespaceValidator(): Validator<string> {
  return new Validator((value) => {
    if (!value) {
      return;
    }
    if (!/\S/.test(value)) {
      return "Cannot contain only spaces";
    }
  }, "Whitespace");
}

export function getPhoneNumberValidator(): Validator<string> {
  return new Validator((value) => {
    if (!value) {
      return;
    }
    if (/[^0-9+ ]/.test(value)) {
      return "Can only contain digits, spaces and \"+\"";
    }
  }, "PhoneNumber");
}

export function getPunctuationValidator(
  errorMessage = `Please provide a valid value`
): Validator<string> {
  return new Validator((value) => {
    if (!value) {
      return;
    }
    if (!/[^!"#$%&'()*+,\-./:;<=>?@[\]^_`{|}~\\\s]/.test(value)) {
      return errorMessage;
    }
  }, "Punctuation");
}

export function getNumberValidator({
  maxNum = Infinity,
  minNum = -Infinity,
  customText = undefined as string | undefined
}): Validator<string> {
  return new Validator((value) => {
    if (isNaN(+value)) {
      return "Must be a number";
    } else if (
      customText &&
      (+value < minNum || +value > maxNum)
    ) {
      return customText;
    } else if (+value > maxNum) {
      return `The number must be less than ${maxNum}`;
    } else if (+value < minNum) {
      return `The number must be greater than ${minNum}`;
    }
  }, "Length");
}
