import React, { useEffect, useState } from 'react'
import '../../styles/reels.css'
import { api } from '../../utils/api'
import ReelFeed from '../../components/ReelFeed'
import { getApiErrorMessage } from '../../utils/apiError'

const Saved = () => {
    const [ videos, setVideos ] = useState([])
    const [ loading, setLoading ] = useState(true)
    const [ error, setError ] = useState('')

    useEffect(() => {
        api.get("/api/food/save")
            .then(response => {
                const savedFoods = response.data.savedFoods.map((item) => ({
                    _id: item.food._id,
                    video: item.food.video,
                    description: item.food.description,
                    likeCount: item.food.likeCount,
                    savesCount: item.food.savesCount,
                    commentsCount: item.food.commentsCount,
                    foodPartner: item.food.foodPartner,
                    saved: true,
                }))
                setVideos(savedFoods)
            })
            .catch((requestError) => setError(getApiErrorMessage(requestError, 'Could not load saved videos. Please try again.')))
            .finally(() => setLoading(false))
    }, [])

    const removeSaved = async (item) => {
        await api.post("/api/food/save", { foodId: item._id })
        setVideos((prev) => prev.filter((v) => v._id !== item._id))
    }

    const likeVideo = async (item) => {
        const response = await api.post("/api/food/like", { foodId: item._id })
        const liked = response.data.like
        setVideos((prev) => prev.map((video) => video._id === item._id ? { ...video, liked, likeCount: Math.max(0, (video.likeCount || 0) + (liked ? 1 : -1)) } : video))
    }

    return (
        loading ? <div className="feed-status">Loading saved videos...</div> : error ? <div className="feed-status" role="alert">{error}</div> : <ReelFeed
            items={videos}
            onLike={likeVideo}
            onSave={removeSaved}
            emptyMessage="No saved videos yet."
        />
    )
}

export default Saved
