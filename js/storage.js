/**
 * Local Storage Manager for the Interactive Comments Section
 */

const Storage = {
    STORAGE_KEY: 'interactive-comments-data',

    /**
     * Get data from localStorage or return initial data
     * @returns {Object} Comments data
     */
    getData() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                const data = JSON.parse(stored);
                // Validate data structure
                if (this.validateData(data)) {
                    return data;
                }
            }
        } catch (error) {
            console.warn('Error reading from localStorage:', error);
        }

        // Return initial data if no valid stored data
        return this.getInitialData();
    },

    /**
     * Save data to localStorage
     * @param {Object} data - Data to save
     */
    saveData(data) {
        try {
            if (this.validateData(data)) {
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
                return true;
            } else {
                console.error('Invalid data structure, not saving to localStorage');
                return false;
            }
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            Utils.showNotification('Failed to save data locally', 'error');
            return false;
        }
    },

    /**
     * Validate data structure
     * @param {Object} data - Data to validate
     * @returns {boolean} True if valid
     */
    validateData(data) {
        return (
            data &&
            typeof data === 'object' &&
            data.currentUser &&
            typeof data.currentUser === 'object' &&
            data.currentUser.username &&
            Array.isArray(data.comments)
        );
    },

    /**
     * Get initial data from data.json or fallback
     * @returns {Object} Initial data
     */
    getInitialData() {
        // Fallback data structure
        return {
            currentUser: {
                image: {
                    png: "./images/avatars/image-juliusomo.png",
                    webp: "./images/avatars/image-juliusomo.webp"
                },
                username: "juliusomo"
            },
            comments: [
                {
                    id: 1,
                    content: "Impressive! Though it seems the drag feature could be improved. But overall it looks incredible. You've nailed the design and the responsiveness at various breakpoints works really well.",
                    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
                    score: 12,
                    user: {
                        image: {
                            png: "./images/avatars/image-amyrobson.png",
                            webp: "./images/avatars/image-amyrobson.webp"
                        },
                        username: "amyrobson"
                    },
                    replies: []
                },
                {
                    id: 2,
                    content: "Woah, your project looks awesome! How long have you been coding for? I'm still new, but think I want to dive into React as well soon. Perhaps you can give me an insight on where I can learn React? Thanks!",
                    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
                    score: 5,
                    user: {
                        image: {
                            png: "./images/avatars/image-maxblagun.png",
                            webp: "./images/avatars/image-maxblagun.webp"
                        },
                        username: "maxblagun"
                    },
                    replies: [
                        {
                            id: 3,
                            content: "If you're still new, I'd recommend focusing on the fundamentals of HTML, CSS, and JS before considering React. It's very tempting to jump ahead but lay a solid foundation first.",
                            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
                            score: 4,
                            replyingTo: "maxblagun",
                            user: {
                                image: {
                                    png: "./images/avatars/image-ramsesmiron.png",
                                    webp: "./images/avatars/image-ramsesmiron.webp"
                                },
                                username: "ramsesmiron"
                            }
                        },
                        {
                            id: 4,
                            content: "I couldn't agree more with this. Everything moves so fast and it always seems like everyone knows the newest library/framework. But the fundamentals are what stay constant.",
                            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
                            score: 2,
                            replyingTo: "ramsesmiron",
                            user: {
                                image: {
                                    png: "./images/avatars/image-juliusomo.png",
                                    webp: "./images/avatars/image-juliusomo.webp"
                                },
                                username: "juliusomo"
                            }
                        }
                    ]
                }
            ]
        };
    },

    /**
     * Load initial data from data.json file
     * @returns {Promise<Object>} Promise that resolves to data
     */
    async loadInitialData() {
        try {
            const response = await fetch('./data.json');
            if (!response.ok) {
                throw new Error('Failed to fetch data.json');
            }
            const data = await response.json();

            // Convert string dates to ISO strings for consistency
            const processComments = (comments) => {
                return comments.map(comment => ({
                    ...comment,
                    createdAt: this.convertToISODate(comment.createdAt),
                    replies: comment.replies ? processComments(comment.replies) : []
                }));
            };

            data.comments = processComments(data.comments);

            return data;
        } catch (error) {
            console.warn('Could not load data.json, using fallback data:', error);
            return this.getInitialData();
        }
    },

    /**
     * Convert relative time strings to ISO dates
     * @param {string} timeString - Relative time string like "1 month ago"
     * @returns {string} ISO date string
     */
    convertToISODate(timeString) {
        const now = new Date();
        const timeValue = parseInt(timeString);

        if (timeString.includes('month')) {
            return new Date(now.getTime() - timeValue * 30 * 24 * 60 * 60 * 1000).toISOString();
        } else if (timeString.includes('week')) {
            return new Date(now.getTime() - timeValue * 7 * 24 * 60 * 60 * 1000).toISOString();
        } else if (timeString.includes('day')) {
            return new Date(now.getTime() - timeValue * 24 * 60 * 60 * 1000).toISOString();
        } else if (timeString.includes('hour')) {
            return new Date(now.getTime() - timeValue * 60 * 60 * 1000).toISOString();
        } else if (timeString.includes('minute')) {
            return new Date(now.getTime() - timeValue * 60 * 1000).toISOString();
        }

        return now.toISOString();
    },

    /**
     * Clear all stored data
     */
    clearData() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            Utils.showNotification('Data cleared successfully', 'success');
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            Utils.showNotification('Failed to clear data', 'error');
        }
    },

    /**
     * Export data as JSON
     * @returns {string} JSON string of data
     */
    exportData() {
        const data = this.getData();
        return JSON.stringify(data, null, 2);
    },

    /**
     * Import data from JSON string
     * @param {string} jsonString - JSON string to import
     * @returns {boolean} Success status
     */
    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (this.validateData(data)) {
                this.saveData(data);
                Utils.showNotification('Data imported successfully', 'success');
                return true;
            } else {
                Utils.showNotification('Invalid data format', 'error');
                return false;
            }
        } catch (error) {
            console.error('Error importing data:', error);
            Utils.showNotification('Failed to import data', 'error');
            return false;
        }
    },

    /**
     * Check if localStorage is available
     * @returns {boolean} True if localStorage is available
     */
    isStorageAvailable() {
        try {
            const test = '__localStorage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            return false;
        }
    },

    /**
     * Get storage usage information
     * @returns {Object} Storage usage info
     */
    getStorageInfo() {
        if (!this.isStorageAvailable()) {
            return { available: false };
        }

        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            const size = data ? new Blob([data]).size : 0;

            return {
                available: true,
                size: size,
                sizeFormatted: this.formatBytes(size),
                lastModified: localStorage.getItem(this.STORAGE_KEY + '_timestamp') || 'Unknown'
            };
        } catch (error) {
            return { available: true, error: error.message };
        }
    },

    /**
     * Format bytes to human readable format
     * @param {number} bytes - Number of bytes
     * @returns {string} Formatted string
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Storage;
}
