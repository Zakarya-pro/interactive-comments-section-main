/**
 * Main Application Controller for Interactive Comments Section
 */

class CommentsApp {
    constructor() {
        this.data = null;
        this.currentUser = null;
        this.elements = {};
        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            // Show loading state
            this.showLoadingState();

            // Load data
            await this.loadData();

            // Cache DOM elements
            this.cacheElements();

            // Set up event listeners
            this.setupEventListeners();

            // Render initial comments
            this.renderComments();

            // Hide loading state
            this.hideLoadingState();

            console.log('Comments app initialized successfully');
        } catch (error) {
            console.error('Error initializing app:', error);
            this.showErrorState('Failed to load comments. Please refresh the page.');
        }
    }

    /**
     * Load data from storage or initial source
     */
    async loadData() {
        try {
            // First try to load from localStorage
            this.data = Storage.getData();

            // If no stored data, try to load from data.json
            if (!this.data || this.data.comments.length === 0) {
                this.data = await Storage.loadInitialData();
                Storage.saveData(this.data);
            }

            this.currentUser = this.data.currentUser;
        } catch (error) {
            console.error('Error loading data:', error);
            // Use fallback data
            this.data = Storage.getInitialData();
            this.currentUser = this.data.currentUser;
        }
    }

    /**
 * Cache DOM elements
 */
    cacheElements() {
        this.elements = {
            commentsList: document.getElementById('comments-list'),
            addCommentForm: document.getElementById('add-comment-form'),
            newCommentText: document.getElementById('new-comment-text'),
            deleteModal: document.getElementById('delete-modal'),
            confirmDelete: document.getElementById('confirm-delete'),
            cancelDelete: document.getElementById('cancel-delete'),
            loadingState: document.getElementById('loading-state'),
            errorState: document.getElementById('error-state')
        };

        // Check if essential elements exist
        if (!this.elements.commentsList) {
            console.error('Comments list element not found');
        }
        if (!this.elements.addCommentForm) {
            console.error('Add comment form element not found');
        }
        if (!this.elements.newCommentText) {
            console.error('New comment textarea element not found');
        }
    }

    /**
 * Set up event listeners
 */
    setupEventListeners() {
        // Add comment form
        if (this.elements.addCommentForm) {
            this.elements.addCommentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAddComment();
            });
        }

        // Delete modal events
        if (this.elements.confirmDelete) {
            this.elements.confirmDelete.addEventListener('click', () => {
                this.handleDeleteConfirm();
            });
        }

        if (this.elements.cancelDelete) {
            this.elements.cancelDelete.addEventListener('click', () => {
                this.hideDeleteModal();
            });
        }

        // Close modal on overlay click
        if (this.elements.deleteModal) {
            this.elements.deleteModal.addEventListener('click', (e) => {
                if (e.target === this.elements.deleteModal) {
                    this.hideDeleteModal();
                }
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.elements.deleteModal && this.elements.deleteModal.style.display !== 'none') {
                this.hideDeleteModal();
            }
        });

        // Custom events
        document.addEventListener('commentVote', (e) => {
            this.handleVote(e.detail.commentId, e.detail.action);
        });

        document.addEventListener('createReply', (e) => {
            this.handleCreateReply(e.detail);
        });

        document.addEventListener('updateComment', (e) => {
            this.handleUpdateComment(e.detail);
        });

        document.addEventListener('showDeleteModal', (e) => {
            this.showDeleteModal(e.detail.commentId);
        });

        // Window resize for responsive updates
        window.addEventListener('resize', Utils.debounce(() => {
            this.handleResize();
        }, 250));

        // Save data before page unload
        window.addEventListener('beforeunload', () => {
            this.saveData();
        });

        // Auto-save data periodically
        setInterval(() => {
            this.saveData();
        }, 30000); // Save every 30 seconds
    }

    /**
     * Render all comments
     */
    renderComments() {
        // Clear existing comments
        this.elements.commentsList.innerHTML = '';

        // Sort comments by score (descending)
        const sortedComments = [...this.data.comments].sort((a, b) => b.score - a.score);

        // Render each comment
        sortedComments.forEach(comment => {
            this.renderComment(comment);
        });

        // Update timestamps
        this.updateTimestamps();
    }

    /**
     * Render a single comment
     * @param {Object} comment - Comment data
     */
    renderComment(comment) {
        const commentElement = Components.createComment(comment, this.currentUser);
        this.elements.commentsList.appendChild(commentElement);

        // Render replies if they exist
        if (comment.replies && comment.replies.length > 0) {
            const repliesContainer = Components.createRepliesContainer(comment.replies, this.currentUser);
            commentElement.appendChild(repliesContainer);
        }

        // Add animation
        commentElement.classList.add('fade-in');
    }

    /**
 * Handle adding a new comment
 */
    handleAddComment() {
        if (!this.elements.newCommentText) {
            console.error('Comment textarea not found');
            return;
        }

        const content = this.elements.newCommentText.value.trim();

        const validation = Utils.validateComment(content);
        if (!validation.isValid) {
            Utils.showNotification(validation.message, 'error');
            return;
        }

        const newComment = {
            id: Utils.generateId(),
            content: content,
            createdAt: new Date().toISOString(),
            score: 0,
            user: {
                image: this.currentUser.image,
                username: this.currentUser.username
            },
            replies: []
        };

        // Add to data
        this.data.comments.push(newComment);

        // Re-render comments
        this.renderComments();

        // Clear form
        this.elements.newCommentText.value = '';

        // Save data
        this.saveData();

        // Show success message
        Utils.showNotification('Comment added successfully!', 'success');

        // Scroll to new comment
        setTimeout(() => {
            const newCommentElement = document.querySelector(`[data-comment-id="${newComment.id}"]`);
            Utils.scrollToElement(newCommentElement);
        }, 100);
    }

    /**
     * Handle voting on a comment
     * @param {number} commentId - Comment ID
     * @param {string} action - Vote action (upvote/downvote)
     */
    handleVote(commentId, action) {
        const comment = this.findComment(commentId);
        if (!comment) return;

        // Update score
        if (action === 'upvote') {
            comment.score += 1;
        } else if (action === 'downvote') {
            comment.score = Math.max(0, comment.score - 1); // Don't go below 0
        }

        // Update UI
        const scoreElement = document.querySelector(`[data-comment-id="${commentId}"] .voting__score`);
        if (scoreElement) {
            scoreElement.textContent = comment.score;
            scoreElement.setAttribute('aria-label', `Score: ${comment.score}`);
        }

        // Add visual feedback
        const votingElement = document.querySelector(`[data-comment-id="${commentId}"] .voting`);
        if (votingElement) {
            votingElement.classList.add('voting--animated');
            setTimeout(() => {
                votingElement.classList.remove('voting--animated');
            }, 300);
        }

        // Save data
        this.saveData();
    }

    /**
     * Handle creating a reply
     * @param {Object} replyData - Reply data
     */
    handleCreateReply(replyData) {
        const { parentId, replyingTo, content } = replyData;
        const parentComment = this.findComment(parentId);

        if (!parentComment) return;

        const newReply = {
            id: Utils.generateId(),
            content: content,
            createdAt: new Date().toISOString(),
            score: 0,
            replyingTo: replyingTo,
            user: {
                image: this.currentUser.image,
                username: this.currentUser.username
            }
        };

        // Add reply to parent comment
        if (!parentComment.replies) {
            parentComment.replies = [];
        }
        parentComment.replies.push(newReply);

        // Re-render comments
        this.renderComments();

        // Save data
        this.saveData();

        // Show success message
        Utils.showNotification('Reply added successfully!', 'success');

        // Scroll to new reply
        setTimeout(() => {
            const newReplyElement = document.querySelector(`[data-comment-id="${newReply.id}"]`);
            Utils.scrollToElement(newReplyElement);
        }, 100);
    }

    /**
     * Handle updating a comment
     * @param {Object} updateData - Update data
     */
    handleUpdateComment(updateData) {
        const { commentId, content } = updateData;
        const comment = this.findComment(commentId);

        if (!comment) return;

        // Update content
        comment.content = content;

        // Update UI
        const contentElement = document.querySelector(`[data-comment-id="${commentId}"] .comment__content`);
        if (contentElement) {
            const replyToText = comment.replyingTo ? `<span class="reply-to">@${comment.replyingTo}</span> ` : '';
            contentElement.innerHTML = replyToText + Utils.sanitizeHtml(content);
        }

        // Save data
        this.saveData();

        // Show success message
        Utils.showNotification('Comment updated successfully!', 'success');
    }

    /**
 * Show delete confirmation modal
 * @param {number} commentId - Comment ID to delete
 */
    showDeleteModal(commentId) {
        this.deleteTargetId = commentId;
        if (this.elements.deleteModal) {
            this.elements.deleteModal.style.display = 'flex';
            this.elements.deleteModal.removeAttribute('hidden');
            this.elements.deleteModal.setAttribute('aria-hidden', 'false');

            // Focus the modal
            setTimeout(() => {
                if (this.elements.confirmDelete) {
                    this.elements.confirmDelete.focus();
                }
            }, 100);

            // Prevent body scroll
            document.body.style.overflow = 'hidden';
        }
    }

    /**
     * Hide delete confirmation modal
     */
    hideDeleteModal() {
        if (this.elements.deleteModal) {
            this.elements.deleteModal.style.display = 'none';
            this.elements.deleteModal.setAttribute('hidden', '');
            this.elements.deleteModal.setAttribute('aria-hidden', 'true');
        }
        this.deleteTargetId = null;

        // Restore body scroll
        document.body.style.overflow = '';
    }

    /**
     * Handle delete confirmation
     */
    handleDeleteConfirm() {
        if (!this.deleteTargetId) return;

        const comment = this.findComment(this.deleteTargetId);
        if (!comment) return;

        // Remove comment or reply
        this.removeComment(this.deleteTargetId);

        // Re-render comments
        this.renderComments();

        // Hide modal
        this.hideDeleteModal();

        // Save data
        this.saveData();

        // Show success message
        Utils.showNotification('Comment deleted successfully!', 'success');
    }

    /**
     * Remove a comment or reply
     * @param {number} commentId - Comment ID to remove
     */
    removeComment(commentId) {
        // Try to find and remove from main comments
        const commentIndex = this.data.comments.findIndex(c => c.id === commentId);
        if (commentIndex !== -1) {
            this.data.comments.splice(commentIndex, 1);
            return;
        }

        // Try to find and remove from replies
        for (const comment of this.data.comments) {
            if (comment.replies) {
                const replyIndex = comment.replies.findIndex(r => r.id === commentId);
                if (replyIndex !== -1) {
                    comment.replies.splice(replyIndex, 1);
                    return;
                }
            }
        }
    }

    /**
     * Find a comment by ID
     * @param {number} commentId - Comment ID
     * @returns {Object|null} Comment object or null
     */
    findComment(commentId) {
        // Check main comments
        for (const comment of this.data.comments) {
            if (comment.id === commentId) {
                return comment;
            }

            // Check replies
            if (comment.replies) {
                for (const reply of comment.replies) {
                    if (reply.id === commentId) {
                        return reply;
                    }
                }
            }
        }
        return null;
    }

    /**
     * Update all timestamps
     */
    updateTimestamps() {
        const timestampElements = document.querySelectorAll('.timestamp');
        timestampElements.forEach(element => {
            const commentElement = element.closest('[data-comment-id]');
            if (commentElement) {
                const commentId = parseInt(commentElement.dataset.commentId);
                const comment = this.findComment(commentId);
                if (comment) {
                    element.textContent = Utils.formatTimeAgo(comment.createdAt);
                }
            }
        });
    }

    /**
 * Handle window resize
 */
    handleResize() {
        // No need to re-render for responsive design changes
        // CSS handles the responsive layout automatically
    }

    /**
     * Save data to storage
     */
    saveData() {
        Storage.saveData(this.data);
    }

    /**
 * Show loading state
 */
    showLoadingState() {
        if (this.elements.loadingState) {
            this.elements.loadingState.style.display = 'flex';
            this.elements.loadingState.removeAttribute('hidden');
        }
        if (this.elements.commentsList) {
            this.elements.commentsList.style.display = 'none';
        }
    }

    /**
     * Hide loading state
     */
    hideLoadingState() {
        if (this.elements.loadingState) {
            this.elements.loadingState.style.display = 'none';
            this.elements.loadingState.setAttribute('hidden', '');
        }
        if (this.elements.commentsList) {
            this.elements.commentsList.style.display = 'block';
        }
    }

    /**
 * Show error state
 * @param {string} message - Error message
 */
    showErrorState(message) {
        if (this.elements.errorState) {
            this.elements.errorState.style.display = 'flex';
            this.elements.errorState.removeAttribute('hidden');
            const errorMsg = this.elements.errorState.querySelector('.error-message');
            if (errorMsg) {
                errorMsg.textContent = message;
            }
        }
        if (this.elements.loadingState) {
            this.elements.loadingState.style.display = 'none';
            this.elements.loadingState.setAttribute('hidden', '');
        }
        if (this.elements.commentsList) {
            this.elements.commentsList.style.display = 'none';
        }
    }

    /**
     * Hide error state
     */
    hideErrorState() {
        if (this.elements.errorState) {
            this.elements.errorState.style.display = 'none';
            this.elements.errorState.setAttribute('hidden', '');
        }
        if (this.elements.commentsList) {
            this.elements.commentsList.style.display = 'block';
        }
    }

    /**
     * Export data for backup
     */
    exportData() {
        const dataStr = Storage.exportData();
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `comments-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();

        URL.revokeObjectURL(url);
        Utils.showNotification('Data exported successfully!', 'success');
    }

    /**
     * Import data from file
     * @param {File} file - JSON file to import
     */
    async importData(file) {
        try {
            const text = await file.text();
            if (Storage.importData(text)) {
                this.data = Storage.getData();
                this.currentUser = this.data.currentUser;
                this.renderComments();
            }
        } catch (error) {
            console.error('Error importing data:', error);
            Utils.showNotification('Failed to import data', 'error');
        }
    }

    /**
     * Reset data to initial state
     */
    resetData() {
        if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
            Storage.clearData();
            this.data = Storage.getInitialData();
            this.currentUser = this.data.currentUser;
            this.renderComments();
            Utils.showNotification('Data reset successfully!', 'success');
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app...');

    // Check for browser support
    if (!Storage.isStorageAvailable()) {
        console.warn('localStorage is not available, data will not persist');
    }

    // Initialize the app
    try {
        window.commentsApp = new CommentsApp();
        console.log('App initialized successfully');
    } catch (error) {
        console.error('Failed to initialize app:', error);
    }

    // Update timestamps periodically
    setInterval(() => {
        if (window.commentsApp) {
            window.commentsApp.updateTimestamps();
        }
    }, 60000); // Update every minute

    // Add developer tools in console
    if (typeof window !== 'undefined') {
        window.devTools = {
            exportData: () => window.commentsApp.exportData(),
            resetData: () => window.commentsApp.resetData(),
            getStorageInfo: () => console.table(Storage.getStorageInfo()),
            showNotification: (msg, type) => Utils.showNotification(msg, type)
        };
        console.log('Developer tools available: window.devTools');
    }
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CommentsApp;
}
