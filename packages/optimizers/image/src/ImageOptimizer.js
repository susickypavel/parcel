// @flow
import path from 'path';
import process from 'process';
import {Optimizer} from '@parcel/plugin';
import {blobToBuffer} from '@parcel/utils';
import {md} from '@parcel/diagnostic';
import {optimize} from '../native';

export default (new Optimizer({
  async optimize({bundle, contents, logger}) {
    if (!bundle.env.shouldOptimize) {
      return {contents};
    }

    let buffer = await blobToBuffer(contents);

    // Attempt to optimize it, if the optimize fails we log a warning...
    try {
      let optimized = optimize(bundle.type, buffer);
      return {
        contents: optimized.length < buffer.length ? optimized : buffer,
      };
    } catch (err) {
      const filepath = bundle.getMainEntry()?.filePath;
      const filename = filepath
        ? path.relative(process.cwd(), filepath)
        : 'unknown';
      logger.warn({
        message: md`Could not optimize image ${filename}: ${err.message}`,
        stack: err.stack,
      });
    }

    return {contents: buffer};
  },
}): Optimizer);
