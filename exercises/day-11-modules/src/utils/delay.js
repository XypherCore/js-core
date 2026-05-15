// just export the delay function you already know

export function delay(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}