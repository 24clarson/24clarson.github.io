principalVariation(pos, depth, alpha, beta) {
  if (Date.now()-this.start>this.limit) { this.stop = true; }
  if (this.stop) { return; }
  if (pos.hash in this.transpos) {
    const transposition = this.transpos[pos.hash];
    if (depth<=transposition[1]) { return transposition[0]; }
  }
  if (pos.player*pos.score<-1e5) {
    this.transpos[pos.hash] = [pos.player*(-1e6-depth),depth];
    return pos.player*(-1e6-depth);
  }
  if (this.repeats[pos.hash]>=2) { return 0; }
  if (depth<=0) {
    let captures = pos.captures();
    if (captures) {
      let best = pos.score;
      let first = true;
      if (pos.player==1) {
        for (let category of captures) {
          for (let mv of category) {
            if (first) {
              best = Math.max(best, this.principalVariation(pos.update(mv),0,alpha,beta)+pos.structure(mv));
              first = false
            } else {
              let evl = this.principalVariation(pos.update(mv),0,best-1,best)+pos.structure(mv);
              if (best<evl&&evl<beta) {
                best = this.principalVariation(pos.update(mv),0,alpha,beta)+pos.structure(mv);
              }
            }
            alpha = Math.max(alpha, best);
            if (beta<=alpha) { this.transpos[pos.hash]=[best,depth]; return best; }
          }
        }
      } else {
        for (let category of captures) {
          for (let mv of category) {
            if (first) {
              best = Math.min(best, this.principalVariation(pos.update(mv),0,alpha,beta)+pos.structure(mv));
              first = false
            } else {
              let evl = this.principalVariation(pos.update(mv),0,best-1,best)+pos.structure(mv);
              if (evl<best&&alpha<evl) {
                best = this.principalVariation(pos.update(mv),0,alpha,beta)+pos.structure(mv);
              }
            }
            beta = Math.min(beta, best);
            if (beta<=alpha) { this.transpos[pos.hash]=[best,depth]; return best; }
          }
        }
      }
      this.transpos[pos.hash] = [best,depth];
      return best;
    } else if (pos.mat[0]>=2*pos.mat[1]||2*pos.mat[0]<=pos.mat[1]) {
      const score = pos.endgame();
      this.transpos[pos.hash] = [score,depth];
      return score;
    } else {
      this.transpos[pos.hash] = [pos.score,depth];
      return pos.score;
    }
  }
  let best;
  if (pos.player==1) {
    best = -Infinity;
    let first = true;
    for (let mv of pos.moves()) {
      let evl;
      if (first) {
        evl = this.principalVariation(pos.update(mv),depth-1,alpha,beta)+pos.structure(mv);
        first = false;
      } else {
        evl = this.principalVariation(pos.update(mv),depth-1,best-1,best)+pos.structure(mv);
        if (best<evl&&evl<beta) {
          evl = this.principalVariation(pos.update(mv),depth-1,alpha,beta)+pos.structure(mv);
        }
      }
      evl = (evl>pos.score)?evl+depth:evl-depth;
      best = Math.max(best, evl);
      alpha = Math.max(alpha, best);
      if (beta<=alpha) { break; }
    }
  } else {
    best = Infinity;
    let first = true;
    for (let mv of pos.moves()) {
      let evl;
      if (first) {
        evl = this.principalVariation(pos.update(mv),depth-1,alpha,beta)+pos.structure(mv);
        first = false;
      } else {
        evl = this.principalVariation(pos.update(mv),depth-1,best-1,best)+pos.structure(mv);
        if (evl<best&&evl<alpha) {
          evl = this.principalVariation(pos.update(mv),depth-1,alpha,beta)+pos.structure(mv);
        }
      }
      evl = (evl>pos.score)?evl+depth:evl-depth;
      best = Math.min(best, evl);
      beta = Math.min(beta, best);
      if (beta<=alpha) { break; }
    }
  }
  if (pos.player*best<-1e5) {
    if (pos.legal().length==0&&!pos.check()) { best = 0; }
  }
  this.transpos[pos.hash] = [best,depth];
  return best;
}

// Alpha beta and zero window searches

  alphaBeta(pos, depth, alpha, beta) {
    const hash = pos.hash+depth;
    if (hash in this.transpos) { return this.transpos[hash]; }
    if (pos.player*pos.score<-1e5) {
      this.transpos[hash] = pos.player*(-1e6-depth);
      return pos.player*(-1e6-depth);
    }
    if (this.repeats[pos.hash]>=2) { return 0; }
    if (depth==0) {
      const captures = pos.captures();
      if (captures.length>0) {
        let best = pos.score;
        if (pos.player==1) {
          for (let mv of captures) {
            best = Math.max(best, this.alphaBeta(pos.update(mv),0,alpha,beta));
            alpha = Math.max(alpha, best);
            if (beta<=alpha) { break; }
          }
        } else {
          for (let mv of captures) {
            best = Math.min(best, this.alphaBeta(pos.update(mv),0,alpha,beta));
            beta = Math.min(beta, best);
            if (beta<=alpha) { break; }
          }
        }
        this.transpos[hash] = best;
        return best;
      } else if (pos.mat[0]>=2*pos.mat[1]||2*pos.mat[0]<=pos.mat[1]) {
        const score = pos.endgame();
        this.transpos[hash] = score;
        return score;
      } else {
        this.transpos[hash] = pos.score;
        return pos.score;
      }
    }
    const moves = pos.moves();
    let best;
    if (pos.player==1) {
      best = -Infinity;
      for (let mv of moves) {
        let evl = this.alphaBeta(pos.update(mv),depth-1,alpha,beta)+pos.structure(mv);
        evl = (evl>0)?evl+depth:evl-depth;
        best = Math.max(best, evl);
        alpha = Math.max(alpha, best);
        if (beta<=alpha) { break; }
      }
    } else {
      best = Infinity;
      for (let mv of moves) {
        let evl = this.alphaBeta(pos.update(mv),depth-1,alpha,beta)+pos.structure(mv);
        evl = (evl>0)?evl+depth:evl-depth;
        best = Math.min(best, evl);
        beta = Math.min(beta, best);
        if (beta<=alpha) { break; }
      }
    }
    if (pos.player*best<-1e5) {
      if (pos.moves(true).length==0&&!pos.check()) { best = 0; }
    }
    this.transpos[hash] = best;
    return best;
  }
  zeroWindow(pos, depth, error, guess, alpha, beta) {
    let lower = -1e6-50;
    let upper = 1e6+50;
    let window = guess;
    let bound;
    while (lower<upper-error) {
      bound = this.alphaBeta(pos, depth, window-1, window);
      if (bound<alpha||beta<bound) { return bound; }
      if (bound<window) {
        upper = bound;
        window = (upper-lower<70||upper<-1000) ? (lower+upper)/2 : window-50;
      } else {
        lower = bound;
        window = (upper-lower<70||lower>1000) ? (lower+upper)/2 : window+50;
      }
    }
    return bound;
  }

// Quiessence Search

const captures = pos.captures();
if (captures.length>0) {
  let best = pos.score;
  if (pos.player==1) {
    for (let mv of captures) {
      let evl = this.principalVariation(pos.update(mv),0,best-1,best)+pos.structure(mv);
      if (best<evl&&evl<beta) {
        best = this.principalVariation(pos.update(mv),0,alpha,beta)+pos.structure(mv);
      }
      alpha = Math.max(alpha, best);
      if (beta<=alpha) { break; }
    }
  } else {
    for (let mv of captures) {
      let evl = this.principalVariation(pos.update(mv),0,best-1,best)+pos.structure(mv);
      if (evl<best&&alpha<evl) {
        best = this.principalVariation(pos.update(mv),0,alpha,beta)+pos.structure(mv);
      }
      beta = Math.min(beta, best);
      if (beta<=alpha) { break; }
    }
  }
  this.transpos[pos.hash] = [best,depth];
  return best;
} else if (pos.mat[0]>=2*pos.mat[1]||2*pos.mat[0]<=pos.mat[1]) {
  const score = pos.endgame();
  this.transpos[pos.hash] = [score,depth];
  return score;
} else {
  this.transpos[pos.hash] = [pos.score,depth];
  return pos.score;
}

      if (depth==0) {
        alpha = 0;
        beta = 0;
      }
      const captures = pos.captures();
      if (captures.length>0) {
        let best = pos.score;
        if (pos.player==1) {
          for (let mv of captures) {
            let evl = this.principalVariation(pos.update(mv),depth-1,best-1,best)+pos.structure(mv);
            if (best<evl&&evl<beta) {
              best = this.principalVariation(pos.update(mv),depth-1,alpha,beta)+pos.structure(mv);
            }
            alpha = Math.max(alpha, best);
            if (beta<=alpha) { break; }
          }
        } else {
          for (let mv of captures) {
            let evl = this.principalVariation(pos.update(mv),0,best-1,best)+pos.structure(mv);
            if (evl<best&&alpha<evl) {
              best = this.principalVariation(pos.update(mv),0,alpha,beta)+pos.structure(mv);
            }
            beta = Math.min(beta, best);
            if (beta<=alpha) { break; }
          }
        }
        this.transpos[pos.hash] = [best,depth];
        return best;
      } else 