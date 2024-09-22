module.exports = {
  /**
   * Obtains parameters from the hash of the URL
   * @return Object
   */
  getHashParams: () => {
    let hashParams = {};
    let e, r = /([^&;=]+)=?([^&;]*)/g,
      q = window.location.hash.substring(1);
    while (e = r.exec(q)) {
      hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
  }
}
