export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
    if (password.length < 8) {
        return { isValid: false, message: "비밀번호는 8자 이상이어야 합니다." };
    }
    if (!/[A-Z]/.test(password)) {
        return { isValid: false, message: "비밀번호에는 최소 하나의 대문자가 포함되어야 합니다." };
    }
    if (!/[a-z]/.test(password)) {
        return { isValid: false, message: "비밀번호에는 최소 하나의 소문자가 포함되어야 합니다." };
    }
    if (!/[0-9]/.test(password)) {
        return { isValid: false, message: "비밀번호에는 최소 하나의 숫자가 포함되어야 합니다." };
    }
    if (!/[!@#$%^&*]/.test(password)) {
        return { isValid: false, message: "비밀번호에는 최소 하나의 특수문자(!@#$%^&*)가 포함되어야 합니다." };
    }
    return { isValid: true };
};
