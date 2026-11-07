import Foundation
import AVFoundation
import CoreVideo
import CoreGraphics

let output = URL(fileURLWithPath: CommandLine.arguments[1])
precondition(!FileManager.default.fileExists(atPath: output.path))
let width = 320, height = 568, fps: Int32 = 24, frames = 96
let writer = try AVAssetWriter(outputURL: output, fileType: .mp4)
let input = AVAssetWriterInput(mediaType: .video, outputSettings: [
    AVVideoCodecKey: AVVideoCodecType.h264,
    AVVideoWidthKey: width,
    AVVideoHeightKey: height,
    AVVideoCompressionPropertiesKey: [AVVideoAverageBitRateKey: 250_000]
])
input.expectsMediaDataInRealTime = false
let adapter = AVAssetWriterInputPixelBufferAdaptor(assetWriterInput: input, sourcePixelBufferAttributes: [
    kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32ARGB,
    kCVPixelBufferWidthKey as String: width,
    kCVPixelBufferHeightKey as String: height,
    kCVPixelBufferCGImageCompatibilityKey as String: true,
    kCVPixelBufferCGBitmapContextCompatibilityKey as String: true
])
writer.add(input)
precondition(writer.startWriting())
writer.startSession(atSourceTime: .zero)
for frame in 0..<frames {
    while !input.isReadyForMoreMediaData { Thread.sleep(forTimeInterval: 0.002) }
    var optional: CVPixelBuffer?
    precondition(CVPixelBufferPoolCreatePixelBuffer(nil, adapter.pixelBufferPool!, &optional) == kCVReturnSuccess)
    let buffer = optional!
    CVPixelBufferLockBaseAddress(buffer, [])
    let context = CGContext(data: CVPixelBufferGetBaseAddress(buffer), width: width, height: height,
        bitsPerComponent: 8, bytesPerRow: CVPixelBufferGetBytesPerRow(buffer),
        space: CGColorSpaceCreateDeviceRGB(), bitmapInfo: CGImageAlphaInfo.noneSkipFirst.rawValue)!
    context.setFillColor(CGColor(gray: 0.93, alpha: 1))
    context.fill(CGRect(x: 0, y: 0, width: width, height: height))
    let phase = Double(frame) / Double(frames) * 2 * Double.pi
    for index in 0..<6 {
        let x = 45 + Double(index % 2) * 135 + sin(phase + Double(index)) * 18
        let y = 65 + Double(index / 2) * 170 + cos(phase + Double(index)) * 20
        context.setFillColor(CGColor(gray: 0.18 + Double(index) * 0.10, alpha: 1))
        context.fillEllipse(in: CGRect(x: x, y: y, width: 80, height: 80))
    }
    CVPixelBufferUnlockBaseAddress(buffer, [])
    precondition(adapter.append(buffer, withPresentationTime: CMTime(value: Int64(frame), timescale: fps)))
}
input.markAsFinished()
let done = DispatchSemaphore(value: 0)
writer.finishWriting { done.signal() }
done.wait()
precondition(writer.status == .completed, writer.error?.localizedDescription ?? "Video writing failed")
print("Original geometric demo video: \(output.path)")
