import React, { VideoHTMLAttributes, useEffect, useRef } from 'react'

export default function Video({ srcObject, ...props }) {
    const refVideo = useRef(null)
    console.info(props.ref,'props.ref')
    useEffect(() => {
        if (!refVideo.current) return
        refVideo.current.srcObject = srcObject
    }, [srcObject])

    return <video ref={refVideo} {...props} />
}
