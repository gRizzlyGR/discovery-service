const parseNumber = (raw: string | undefined, defaultValue: number): number => {
    const parsed = Number(raw);

    if (isNaN(parsed)) {
        return defaultValue;
    }

    return parsed;
}

export {
    parseNumber
}