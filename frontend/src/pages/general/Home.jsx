import React, { useEffect, useState } from 'react'
import { api } from '../../utils/api';
import '../../styles/reels.css'
import ReelFeed from '../../components/ReelFeed'
import { getApiErrorMessage } from '../../utils/apiError'

const Home = () => {
    const [ videos, setVideos ] = useState([])
    const [ loading, setLoading ] = useState(true)
    const [ error, setError ] = useState('')
    // Autoplay behavior is handled inside ReelFeed

    useEffect(() => {
        api.get("/api/food")
            .then(response => {

                setVideos(response.data.foodItems)
            })
            .catch((requestError) => setError(getApiErrorMessage(requestError, 'Could not load videos. Please try again.')))
            .finally(() => setLoading(false))
    }, [])

    // Using local refs within ReelFeed; keeping map here for dependency parity if needed

    async function likeVideo(item) {

        const response = await api.post("/api/food/like", { foodId: item._id })

        if(response.data.like){
            setVideos((prev) => prev.map((v) => v._id === item._id ? { ...v, likeCount: (v.likeCount || 0) + 1 } : v))
            setVideos((prev) => prev.map((v) => v._id === item._id ? { ...v, liked: true } : v))
        }else{
            setVideos((prev) => prev.map((v) => v._id === item._id ? { ...v, likeCount: Math.max(0, (v.likeCount || 0) - 1) } : v))
            setVideos((prev) => prev.map((v) => v._id === item._id ? { ...v, liked: false } : v))
        }
        
    }

    async function saveVideo(item) {
        const response = await api.post("/api/food/save", { foodId: item._id })
        
        if(response.data.save){
            setVideos((prev) => prev.map((v) => v._id === item._id ? { ...v, savesCount: (v.savesCount || 0) + 1 } : v))
            setVideos((prev) => prev.map((v) => v._id === item._id ? { ...v, saved: true } : v))
        }else{
            setVideos((prev) => prev.map((v) => v._id === item._id ? { ...v, savesCount: Math.max(0, (v.savesCount || 0) - 1) } : v))
            setVideos((prev) => prev.map((v) => v._id === item._id ? { ...v, saved: false } : v))
        }
    }

    return (
        loading ? <div className="feed-status">Loading delicious videos...</div> : error ? <div className="feed-status" role="alert">{error}<button onClick={() => window.location.reload()}>Try again</button></div> : <ReelFeed
            items={videos}
            onLike={likeVideo}
            onSave={saveVideo}
            emptyMessage="No videos available."
        />
    )
}

export default Home
