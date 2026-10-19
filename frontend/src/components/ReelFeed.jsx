import React, { useEffect, useRef, useState } from 'react'
import { api } from '../utils/api'
import { Link } from 'react-router-dom'
import { getApiErrorMessage } from '../utils/apiError'

const getVideoSrc = (source) => source ? new URL(source, `${api.defaults.baseURL || window.location.origin}/`).toString() : undefined

// Reusable feed for vertical reels
// Props:
// - items: Array of video items { _id, video, description, likeCount, savesCount, commentsCount, comments, foodPartner }
// - onLike: (item) => void | Promise<void>
// - onSave: (item) => void | Promise<void>
// - emptyMessage: string
const ReelFeed = ({ items = [], onLike, onSave, emptyMessage = 'No videos yet.' }) => {
  const videoRefs = useRef(new Map())
  const [commentsFor, setCommentsFor] = useState(null)
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [commentsError, setCommentsError] = useState('')
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [muted, setMuted] = useState(true)
  const [pausedVideos, setPausedVideos] = useState({})
  const [heartFor, setHeartFor] = useState(null)
  const [actionMessage, setActionMessage] = useState('')
  const [pendingActions, setPendingActions] = useState({})
  const [newCommentCounts, setNewCommentCounts] = useState({})

  const openComments = async (item) => {
    setCommentsFor(item); setComments([]); setCommentsError(''); setCommentText(''); setCommentsLoading(true)
    try { const response = await api.get(`/api/food/${item._id}/comments`); setComments(response.data.comments) }
    catch (error) { setCommentsError(error.response?.status === 401 ? 'Please log in to view and post comments.' : getApiErrorMessage(error, 'Could not load comments. Please try again.')) }
    finally { setCommentsLoading(false) }
  }
  const submitComment = async (event) => {
    event.preventDefault()
    if (!commentText.trim()) return
    setSubmitting(true); setCommentsError('')
    try {
      const response = await api.post(`/api/food/${commentsFor._id}/comments`, { text: commentText })
      setComments((current) => [response.data.comment, ...current]); setCommentText('')
      setNewCommentCounts((current) => ({ ...current, [commentsFor._id]: (current[commentsFor._id] || 0) + 1 }))
    } catch (error) { setCommentsError(error.response?.status === 401 ? 'Please log in to post a comment.' : getApiErrorMessage(error, 'Could not post your comment. Please try again.')) }
    finally { setSubmitting(false) }
  }

  const togglePlayback = (item) => {
    const video = videoRefs.current.get(item._id)
    if (!video) return
    if (video.paused) { video.play().catch(() => {}); setPausedVideos((current) => ({ ...current, [item._id]: false })) }
    else { video.pause(); setPausedVideos((current) => ({ ...current, [item._id]: true })) }
  }

  const toggleLikeWithFeedback = (item) => {
    setHeartFor(item._id)
    window.setTimeout(() => setHeartFor((current) => current === item._id ? null : current), 650)
  }

  const runAction = async (kind, item, callback) => {
    if (!callback || pendingActions[`${kind}-${item._id}`]) return
    const key = `${kind}-${item._id}`
    setActionMessage('')
    setPendingActions((current) => ({ ...current, [key]: true }))
    try { await callback(item) }
    catch (error) { setActionMessage(getApiErrorMessage(error, kind === 'save' ? 'Could not update saved videos.' : 'Could not update your like.')) }
    finally { setPendingActions((current) => ({ ...current, [key]: false })) }
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target
          if (!(video instanceof HTMLVideoElement)) return
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            video.play().then(() => setPausedVideos((current) => ({ ...current, [video.dataset.foodId]: false }))).catch(() => setPausedVideos((current) => ({ ...current, [video.dataset.foodId]: true })))
          } else {
            video.pause()
            setPausedVideos((current) => ({ ...current, [video.dataset.foodId]: true }))
          }
        })
      },
      { threshold: [0, 0.25, 0.6, 0.9, 1] }
    )

    videoRefs.current.forEach((vid) => observer.observe(vid))
    return () => observer.disconnect()
  }, [items])

  const setVideoRef = (id) => (el) => {
    if (!el) { videoRefs.current.delete(id); return }
    el.dataset.foodId = id
    videoRefs.current.set(id, el)
  }

  return (
    <div className="reels-page">
      <div className="reels-feed" role="list">
        {items.length === 0 && (
          <div className="empty-state">
            <p>{emptyMessage}</p>
          </div>
        )}

        {items.map((item) => (
          <section key={item._id} className="reel" role="listitem">
            <video
              ref={setVideoRef(item._id)}
              className="reel-video"
              src={getVideoSrc(item.video)}
              muted={muted}
              playsInline
              loop
              preload="metadata"
              onClick={() => togglePlayback(item)}
              onDoubleClick={() => { toggleLikeWithFeedback(item); runAction('like', item, onLike) }}
            />

            <div className="reel-topbar"><span className="reel-brand">SCROLL<span>BITE</span></span><span className="reel-feed-label">FOR YOU</span><button type="button" className="play-toggle" onClick={() => togglePlayback(item)} aria-label={pausedVideos[item._id] ? 'Play video' : 'Pause video'}>{pausedVideos[item._id] ? '▶' : 'Ⅱ'} <span>{pausedVideos[item._id] ? 'Play' : 'Pause'}</span></button><button type="button" className="sound-toggle" onClick={() => setMuted((value) => !value)} aria-label={muted ? 'Turn sound on' : 'Mute videos'}>{muted ? '♫̸' : '♫'} <span>{muted ? 'Sound off' : 'Sound on'}</span></button></div>
            {pausedVideos[item._id] && <button className="play-indicator" onClick={() => togglePlayback(item)} aria-label="Play video">▶</button>}
            {heartFor === item._id && <div className="heart-burst" aria-hidden="true">♥</div>}

            <div className="reel-overlay">
              <div className="reel-overlay-gradient" aria-hidden="true" />
              <div className="reel-actions">
                <div className="reel-action-group">
                  <button
                    type="button"
                    onClick={(event) => { event.stopPropagation(); if (!pendingActions[`like-${item._id}`]) { toggleLikeWithFeedback(item); runAction('like', item, onLike) } }}
                    className={`reel-action${item.liked ? ' is-active' : ''}`}
                    aria-label="Like"
                    aria-pressed={Boolean(item.liked)}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 22l7.8-8.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
                    </svg>
                  </button>
                  <div className="reel-action__count">{item.likeCount ?? item.likesCount ?? item.likes ?? 0}</div>
                </div>

                <div className="reel-action-group">
                  <button
                    className={`reel-action${item.saved ? ' is-active' : ''}`}
                    type="button"
                    onClick={(event) => { event.stopPropagation(); runAction('save', item, onSave) }}
                    disabled={Boolean(pendingActions[`save-${item._id}`])}
                    aria-label="Bookmark"
                    aria-pressed={Boolean(item.saved)}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />
                    </svg>
                  </button>
                  <div className="reel-action__count">{item.savesCount ?? item.bookmarks ?? item.saves ?? 0}</div>
                </div>

                <div className="reel-action-group">
                  <button type="button" className="reel-action" aria-label="Comments" onClick={(event) => { event.stopPropagation(); openComments(item) }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
                    </svg>
                  </button>
                  <div className="reel-action__count">{(item.commentsCount ?? (Array.isArray(item.comments) ? item.comments.length : 0)) + (newCommentCounts[item._id] || 0)}</div>
                </div>
              </div>

              <div className="reel-content">
                <div className="reel-caption-card">
                  {item.name && <h2 className="reel-title">{item.name}</h2>}
                  {item.foodPartner && <Link className="reel-partner" to={`/food-partner/${item.foodPartner?._id || item.foodPartner}`}>{item.foodPartner?.name || 'Food partner'}</Link>}
                  {item.description && <p className="reel-description" title={item.description}>{item.description}</p>}
                </div>
                {item.foodPartner && (
                  <Link className="reel-btn" to={"/food-partner/" + (item.foodPartner?._id || item.foodPartner)} aria-label="Visit store">Visit store</Link>
                )}
              </div>
            </div>
          </section>
        ))}
      </div>
      {actionMessage && <div className="reel-feedback" role="status">{actionMessage}<button onClick={() => setActionMessage('')} aria-label="Dismiss message">×</button></div>}
      {commentsFor && <div className="comments-backdrop" onClick={() => setCommentsFor(null)}>
        <section className="comments-panel" role="dialog" aria-modal="true" aria-label="Comments" onClick={(event) => event.stopPropagation()}>
          <header><h2>Comments</h2><button type="button" onClick={() => setCommentsFor(null)} aria-label="Close comments">Close</button></header>
          {commentsError && <p className="comments-error" role="alert">{commentsError}{commentsError.includes('log in') && <> <Link to="/user/login">Log in</Link></>}</p>}
          <div className="comments-list">{commentsLoading ? <p className="comments-empty">Loading comments…</p> : comments.length ? comments.map((comment) => <article key={comment._id}><strong>{comment.user?.fullName || 'User'}</strong><p>{comment.text}</p></article>) : !commentsError && <p className="comments-empty">No comments yet. Start the conversation.</p>}</div>
          <form onSubmit={submitComment}><input value={commentText} onChange={(event) => setCommentText(event.target.value)} maxLength={500} placeholder="Add a comment..." aria-label="Add a comment"/><button disabled={submitting || !commentText.trim()}>{submitting ? 'Posting...' : 'Post'}</button></form>
        </section>
      </div>}
    </div>
  )
}

export default ReelFeed
