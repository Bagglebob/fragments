// Use crypto.randomUUID() to create unique IDs, see:
// https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
const { randomUUID } = require('crypto');
// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
const contentType = require('content-type');

// Functions for working with fragment metadata/data using our DB
const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
  deleteFragment,
} = require('./data');

class Fragment {
  constructor({ id, ownerId, created, updated, type, size = 0 }) {
    // TODO
    if (!ownerId) {
      throw new Error('ERROR::OwnerId is required!');
    }
    if (!type) {
      throw new Error('ERROR::Type is required!');
    }

    // Parse type and ensure it's supported
    const { type: mime } = contentType.parse(type);
    if (!Fragment.isSupportedType(mime)) {
      throw new Error(`ERROR::Unsupported type: ${type}`);
    }

    if (size < 0) {
      throw new Error('ERROR::Size cannot be negative!');
    }
    if (!Number.isInteger(size)) {
      throw new Error('ERROR::Size must be a number!');
    }
    this.id = id || randomUUID();
    this.ownerId = ownerId;
    this.created = created || new Date().toISOString();
    this.updated = updated || this.created;
    this.type = type;
    this.size = size;
  }

  /**
   * Get all fragments (id or full) for the given user
   * @param {string} ownerId user's hashed email
   * @param {boolean} expand whether to expand ids to full fragments
   * @returns Promise<Array<Fragment>>
   */
  static async byUser(ownerId, expand = false) {
    let fragments = await listFragments(ownerId, expand);
    if (expand) {
      let f2 = fragments.map((fragment) => {
        const f = new Fragment(fragment);

        // Convert the data field back to a Buffer if necessary
        // !!!Commented code BELOW attached the data to the Fragment object!!!
        // if (fragment.data && fragment.data.type === 'Buffer') {
        //   f.data = Buffer.from(fragment.data.data);
        // }

        return f;
      });

      return Promise.resolve(f2);
    } else {
      return Promise.resolve(fragments);
    }
  }

  /**
   * Gets a fragment for the user by the given id.
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<Fragment>
   */
  static async byId(ownerId, id) {
    // TODO
    // TIP: make sure you properly re-create a full Fragment instance after getting from db.
    let fragment = new Fragment(await readFragment(ownerId, id));
    // !!!Commented code BELOW attached the data to the Fragment object!!!
    // fragment.data = await readFragmentData(ownerId, id);
    return Promise.resolve(fragment);
  }

  /**
   * Delete the user's fragment data and metadata for the given id
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<void>
   */
  static async delete(ownerId, id) {
    // TODO
    await deleteFragment(ownerId, id);
    return Promise.resolve();
  }

  /**
   * Saves the current fragment (metadata) to the database
   * @returns Promise<void>
   */
  save() {
    this.updated = new Date().toISOString();
    writeFragment(this);
    return Promise.resolve();
  }

  /**
   * Gets the fragment's data from the database
   * @returns Promise<Buffer>
   */
  getData() {
    return readFragmentData(this.ownerId, this.id);
  }

  /**
   * Set's the fragment's data in the database
   * @param {Buffer} data
   * @returns Promise<void>
   */
  async setData(data) {
    // TIP: make sure you update the metadata whenever you change the data, so they match
    const bufferData = Buffer.isBuffer(data) ? data : Buffer.from(data);
    let buffsize = Buffer.byteLength(bufferData);

    // update data for fragment
    await writeFragmentData(this.ownerId, this.id, bufferData);
    // update data for "this" instance
    // this.data = bufferData;
    // update the metadata for "this" instance
    this.updated = new Date().toISOString();
    // update the size for "this" instance
    this.size = buffsize;
    // update the fragment with size, updated.
    return await writeFragment(this);
  }

  /**
   * Returns the mime type (e.g., without encoding) for the fragment's type:
   * "text/html; charset=utf-8" -> "text/html"
   * @returns {string} fragment's mime type (without encoding)
   */
  get mimeType() {
    const { type } = contentType.parse(this.type);
    return type;
  }

  /**
   * Returns true if this fragment is a text/* mime type
   * @returns {boolean} true if fragment's type is text/*
   */
  get isText() {
    // TODO
    const { type } = contentType.parse(this.type);
    return type.includes('text/plain');
  }

  /**
   * Returns the formats into which this fragment type can be converted
   * @returns {Array<string>} list of supported mime types
   */
  get formats() {
    // TODO
    const { type } = contentType.parse(this.type);
    return [type];
  }

  /**
   * Returns true if we know how to work with this content type
   * @param {string} value a Content-Type value (e.g., 'text/plain' or 'text/plain: charset=utf-8')
   * @returns {boolean} true if we support this Content-Type (i.e., type/subtype)
   */
  static isSupportedType(value) {
    // TODO
    const { type } = contentType.parse(value);
    const re = /^text\/[a-zA-Z]+$/;
    const reImg = /^(image\/(png|jpeg|gif))$/;
    let res = re.test(type) || reImg.test(type) || type === 'application/json';
    return res;
  }
}

module.exports.Fragment = Fragment;
