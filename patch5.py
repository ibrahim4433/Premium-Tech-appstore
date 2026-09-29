css_append = """
/* Floating Background Animations */
.floating-background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    z-index: -1;
    overflow: hidden;
}

.floating-icon {
    position: absolute;
    bottom: -50px;
    color: var(--text-primary);
    animation: floatUp linear infinite;
}

@keyframes floatUp {
    0% {
        transform: translateY(0) translateX(0) rotate(0deg) scale(0.8);
        opacity: 0;
    }
    10% {
        opacity: 0.15;
    }
    90% {
        opacity: 0.15;
    }
    100% {
        transform: translateY(-110vh) translateX(100px) rotate(360deg) scale(1.2);
        opacity: 0;
    }
}

:root[data-theme="light"] @keyframes floatUp {
    0% {
        transform: translateY(0) translateX(0) rotate(0deg) scale(0.8);
        opacity: 0;
    }
    10% {
        opacity: 0.3;
    }
    90% {
        opacity: 0.3;
    }
    100% {
        transform: translateY(-110vh) translateX(100px) rotate(360deg) scale(1.2);
        opacity: 0;
    }
}
"""

with open("css/style.css", "a") as f:
    f.write(css_append)

print("Appended CSS successfully")
