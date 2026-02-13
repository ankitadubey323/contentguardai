

import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'


const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})


export const submitContent = async (text) => {
  try {
    // Generate unique idempotency key to prevent duplicate submissions
    const idempotencyKey = uuidv4()
    
    const response = await api.post('/content', 
      { text },
      {
        headers: {
          'Idempotency-Key': idempotencyKey
        }
      }
    )
    
    return response.data
  } catch (error) {
    console.error('Error submitting content:', error)
    throw error 
  }
}


export const getContentById = async (contentId) => {
  try {
    const response = await api.get(`/content/${contentId}`)
    return response.data
  } catch (error) {
    console.error('Error fetching content:', error)
    throw error
  }
}


export const getContentList = async (params = {}) => {
  try {
    // Build query string from params
    const queryParams = new URLSearchParams()
    
    if (params.page) queryParams.append('page', params.page)
    if (params.limit) queryParams.append('limit', params.limit)
    if (params.status) queryParams.append('status', params.status)
    if (params.isFlagged !== undefined) queryParams.append('isFlagged', params.isFlagged)
    if (params.moderationAction) queryParams.append('moderationAction', params.moderationAction)
    
    const response = await api.get(`/content?${queryParams.toString()}`)
    return response.data
  } catch (error) {
    console.error('Error fetching content list:', error)
    throw error
  }
}

/**
 * Get statistics about all analyzed content
 * 
 * @returns {Promise} - Response with statistics data
 */
export const getStats = async () => {
  try {
    const response = await api.get('/content/stats')
    return response.data
  } catch (error) {
    console.error('Error fetching stats:', error)
    throw error
  }
}

/**
 * Delete content by ID
 * 
 * @param {string} contentId - The ID of content to delete
 * @returns {Promise} - Response confirming deletion
 */
export const deleteContent = async (contentId) => {
  try {
    const response = await api.delete(`/content/${contentId}`)
    return response.data
  } catch (error) {
    console.error('Error deleting content:', error)
    throw error
  }
}

/**
 * Poll for content status until completed
 * Tries up to maxAttempts times with 1 second delay between attempts
 * 
 * @param {string} contentId - The ID to poll
 * @param {number} maxAttempts - Maximum number of polling attempts (default: 10)
 * @returns {Promise} - Final content data when completed
 */
export const pollForResult = async (contentId, maxAttempts = 10) => {
  let attempts = 0
  
  // Keep trying until we get completed status or hit max attempts
  while (attempts < maxAttempts) {
    try {
      const result = await getContentById(contentId)
      
      // If analysis is complete, return the data
      if (result.data.status === 'completed') {
        return result
      }
      
      // Wait 1 second before next attempt
      await new Promise(resolve => setTimeout(resolve, 1000))
      attempts++
      
    } catch (error) {
      console.error(`Polling attempt ${attempts + 1} failed:`, error)
      attempts++
      
      // If it's the last attempt, throw the error
      if (attempts >= maxAttempts) {
        throw new Error('Polling timeout: Analysis took too long')
      }
      
      // Otherwise, wait and try again
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
  
  throw new Error('Polling timeout: Maximum attempts reached')
}

