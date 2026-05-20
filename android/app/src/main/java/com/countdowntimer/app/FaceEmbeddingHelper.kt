package com.countdowntimer.app

import android.content.Context
import android.graphics.Bitmap
import android.util.Log
import org.tensorflow.lite.Interpreter
import org.tensorflow.lite.support.common.FileUtil
import org.tensorflow.lite.support.image.ImageProcessor
import org.tensorflow.lite.support.image.TensorImage
import org.tensorflow.lite.support.image.ops.ResizeOp
import java.nio.ByteBuffer
import java.nio.ByteOrder

class FaceEmbeddingHelper(private val context: Context) {
    
    private var interpreter: Interpreter? = null
    private val inputSize = 112 // MobileFaceNet input size
    private val embeddingSize = 192 // MobileFaceNet output embedding size

    /**
     * True only when the real MobileFaceNet model loaded successfully.
     * If false, extractEmbedding() will throw rather than silently return a
     * trivially-spoofable pixel-average embedding.
     */
    var isModelLoaded: Boolean = false
        private set
    
    init {
        loadModel()
    }
    
    private fun loadModel() {
        try {
            val model = FileUtil.loadMappedFile(context, "mobile_face_net.tflite")
            val options = Interpreter.Options().apply {
                setNumThreads(4)
            }
            interpreter = Interpreter(model, options)
            isModelLoaded = true
            Log.d("FaceEmbeddingHelper", "MobileFaceNet model loaded successfully")
        } catch (e: Exception) {
            // Do NOT silently fall back to a weak embedding — that would allow any face
            // (or a printed photo) to pass verification. Surface the failure so the caller
            // can block verification and prompt the user to reinstall / contact support.
            isModelLoaded = false
            Log.e("FaceEmbeddingHelper", "CRITICAL: Failed to load MobileFaceNet model — face verification is disabled: ${e.message}")
        }
    }
    
    /**
     * Extract a 192-dimensional face embedding using MobileFaceNet.
     *
     * Returns null if:
     *   - The model failed to load (isModelLoaded == false)
     *   - TFLite inference throws
     *
     * NEVER falls back to a pixel-average embedding. A null return must be
     * treated by the caller as a hard verification failure.
     */
    fun extractEmbedding(bitmap: Bitmap): FloatArray? {
        if (interpreter == null) {
            Log.e("FaceEmbeddingHelper", "extractEmbedding called but model is not loaded — returning null")
            return null
        }
        
        return try {
            // Preprocess image
            val imageProcessor = ImageProcessor.Builder()
                .add(ResizeOp(inputSize, inputSize, ResizeOp.ResizeMethod.BILINEAR))
                .build()
            
            var tensorImage = TensorImage.fromBitmap(bitmap)
            tensorImage = imageProcessor.process(tensorImage)
            
            // Prepare input buffer
            val inputBuffer = ByteBuffer.allocateDirect(4 * inputSize * inputSize * 3)
            inputBuffer.order(ByteOrder.nativeOrder())
            
            val pixels = IntArray(inputSize * inputSize)
            tensorImage.bitmap.getPixels(pixels, 0, inputSize, 0, 0, inputSize, inputSize)
            
            // Normalize pixels to [-1, 1]
            for (pixel in pixels) {
                val r = ((pixel shr 16 and 0xFF) - 127.5f) / 127.5f
                val g = ((pixel shr 8 and 0xFF) - 127.5f) / 127.5f
                val b = ((pixel and 0xFF) - 127.5f) / 127.5f
                inputBuffer.putFloat(r)
                inputBuffer.putFloat(g)
                inputBuffer.putFloat(b)
            }
            
            // Run inference
            val outputBuffer = Array(1) { FloatArray(embeddingSize) }
            interpreter?.run(inputBuffer, outputBuffer)
            
            outputBuffer[0]
        } catch (e: Exception) {
            Log.e("FaceEmbeddingHelper", "TFLite inference failed: ${e.message}")
            null
        }
    }
    
    fun close() {
        interpreter?.close()
    }
}
