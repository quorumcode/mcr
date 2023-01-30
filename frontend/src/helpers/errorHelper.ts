import { errorTexts } from "@/types/errorTexts";
import { useCommonStore } from "@/stores/common";

interface VariableValueInText {
  csvEmailsLimit?: string | number;
  bccInvitationDelayMax?: string | number;
  invitationReminderDelayMin?: string | number;
  invitationReminderDelayMax?: string | number;
}

export function showErrorNotification(
  code: string | undefined,
  methodName: string,
  variableValueInText?: VariableValueInText | VariableValueInText[]
): void {
  const commonStore = useCommonStore();
  if (code) {
    let errorText = errorTexts[methodName][code];

    if (typeof errorText === "undefined") {
      console.error("Error text not found, errorCode:", code);
      errorText = "";
    }

    if (variableValueInText) {
      const varCount = Array.isArray(variableValueInText)
        ? variableValueInText.length
        : 1;

      for (let i = 0; i < varCount; i++) {
        const firstCharIndex = errorText.indexOf("${");
        const lastCharIndex = errorText.indexOf("}", firstCharIndex);
        const varName = errorText.substring(firstCharIndex + 2, lastCharIndex);
        errorText = errorText.replace(
          `\${${varName}}`,
          varCount === 1
            ? variableValueInText[varName]
            : variableValueInText[i][varName]
        );
      }
    }
    commonStore.showNotification("error", errorText);
  } else {
    console.error("errorCode", code);
  }
}

export function getErrorText(
  code: string | undefined,
  methodName: string,
  variableValueInText?: VariableValueInText | VariableValueInText[]
): string {
  let errorText = errorTexts[methodName][code];

  if (typeof errorText === "undefined") {
    console.error("Error text not found, errorCode:", code);
    errorText = "";
  }

  if (variableValueInText) {
    const varCount = Array.isArray(variableValueInText)
      ? variableValueInText.length
      : 1;

    for (let i = 0; i < varCount; i++) {
      const firstCharIndex = errorText.indexOf("${");
      const lastCharIndex = errorText.indexOf("}", firstCharIndex);
      const varName = errorText.substring(firstCharIndex + 2, lastCharIndex);
      errorText = errorText.replace(
        `\${${varName}}`,
        varCount === 1
          ? variableValueInText[varName]
          : variableValueInText[i][varName]
      );
    }
  }
  return errorText;
}
