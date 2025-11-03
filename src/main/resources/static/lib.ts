export function resetForm(form: HTMLElement) {
    (form as HTMLFormElement).reset();
}

export function setValue(element: HTMLElement, value: string) {
    (element as HTMLInputElement).value = value;
}

export function getValue(element: HTMLElement) {
    return (element as HTMLInputElement).value
}
