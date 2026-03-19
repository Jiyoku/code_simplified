document.addEventListener('DOMContentLoaded', () => {
    const sortSelect = document.getElementById('sortSelect')
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            sortPosts(sortSelect.value)
        })
    }
})

function sortPosts(sortBy) {
    const container = document.getElementById('postsContainer')
    const posts = Array.from(container.querySelectorAll('.post-item'))

    posts.sort((a, b) => {
        switch (sortBy) {
            case '-created_at':
                return new Date(b.dataset.created) - new Date(a.dataset.created)
            case '-views':
                return Number(b.dataset.views) - Number(a.dataset.views)
            case '-likes':
                return Number(b.dataset.likes) - Number(a.dataset.likes)
            default:
                return 0
        }
    })

    posts.forEach(post => container.appendChild(post))
}
