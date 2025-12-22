// src/utils/animationUtils.ts

/**
 * Safely sets animation currentTime with validation
 * @param animation - The animation object
 * @param time - The time value to set
 */
export function setAnimationTimeSafely(animation: Animation | null, time: number): void {
    if (!animation) {
        console.error('Animation object is null or undefined');
        return;
    }

    // Ensure the time value is finite and valid
    if (typeof time !== 'number' || !isFinite(time) || isNaN(time)) {
        console.warn('Invalid time value provided, using 0');
        time = 0;
    }

    // Limit time to animation duration
    const safeTime = Math.max(0, Math.min(time, animation.effect?.getTiming()?.duration || 0));

    try {
        animation.currentTime = safeTime;
    } catch (error) {
        console.error('Error setting animation time:', error);
    }
}

/**
 * Safe animation controller class
 */
export class SafeAnimationController {
    /**
     * Safely sets animation currentTime
     * @param animation - The animation object
     * @param time - The time value to set
     * @returns true if successful, false otherwise
     */
    static setTime(animation: Animation | null, time: number): boolean {
        if (!animation) {
            console.error('Animation not defined');
            return false;
        }

        // Convert to number and validate
        const numericTime = Number(time);

        if (!isFinite(numericTime)) {
            console.warn(`Invalid time value: ${time}`);
            return false;
        }

        // Get animation duration
        const duration = animation.effect?.getTiming()?.duration || 0;

        // Ensure time is within bounds
        const limitedTime = Math.min(Math.max(numericTime, 0), duration);

        try {
            animation.currentTime = limitedTime;
            return true;
        } catch (error) {
            console.error('Failed to set currentTime:', error);
            return false;
        }
    }

    /**
     * Safely plays an animation
     * @param animation - The animation object
     * @returns true if successful, false otherwise
     */
    static play(animation: Animation | null): boolean {
        if (!animation) {
            console.error('Animation not defined');
            return false;
        }

        try {
            animation.play();
            return true;
        } catch (error) {
            console.error('Failed to play animation:', error);
            return false;
        }
    }

    /**
     * Safely pauses an animation
     * @param animation - The animation object
     * @returns true if successful, false otherwise
     */
    static pause(animation: Animation | null): boolean {
        if (!animation) {
            console.error('Animation not defined');
            return false;
        }

        try {
            animation.pause();
            return true;
        } catch (error) {
            console.error('Failed to pause animation:', error);
            return false;
        }
    }
}