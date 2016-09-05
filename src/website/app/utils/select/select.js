'use strict';

// todo: this stuff can be optimized quite a bit - currently we sweep over the entire list whenever anything is selected..

function isParent(parent, child) {
  return child.startsWith(parent);
}

function isParentOfAny(parent, children) {
  for (let child of children) {
    if (isParent(parent, child)) {
      return true;
    }
  }
  return false;
}

function isChildOfAny(child, parents) {
  for (let parent of parents) {
    if (isParent(parent, child)) {
      return true;
    }
  }
  return false;
}

function selectAdditions(additions){
  // if you select a file/folder/end to be added, all its parent folders must be selected
  // if you select a folder to be added, its directory-end must be selected
  // if you select a directory-end to be added, its matching folder must be added    

  // sweep up, selecting any parents that have selected files
  let seen = new Set();
  for (let i=additions.length-1; i>=0; i--) {
    if (additions[i].parsed.type === "directory") {
      if (!additions[i].selected && isParentOfAny(additions[i].parsed.path, seen)) {
        additions[i].selected = true;
      }
    } else if (additions[i].selected) {
      seen.add(additions[i].parsed.path);
    }
  }

  // sweep down, selecting any directory-ends that have selected matching folders 
  seen = new Set();
  for (let i=0; i<additions.length; i++) {
    if (additions[i].parsed.type === "directory-end") {
      if (!additions[i].selected && seen.has(additions[i].parsed.path)) {
        additions[i].selected = true;
      }
    } else if (additions[i].selected) {
      seen.add(additions[i].parsed.path);
    }
  }
}

function deselectAdditions(additions){
  // if you deselect a directory, all its contents must be deselected (including its end).
  // if you deselect a directory-end, its matching directory must be deselected, and therefore its contents

  // sweep up, deselecting any content/matching directories that have deselected directory-ends
  let seen = new Set();
  for (let i=additions.length-1; i>=0; i--) {
    if (additions[i].parsed.type !== "directory-end") {
      if (additions[i].selected && isChildOfAny(additions[i].parsed.path, seen)) {
        additions[i].selected = false;
      }
    } else if (!additions[i].selected) {
      seen.add(additions[i].parsed.path);
    }
  }

  // sweep down, deselecting any children of deselected folders 
  seen = new Set();
  for (let i=0; i<additions.length; i++) {
    if (additions[i].parsed.type !== "directory") {
      if (additions[i].selected && isChildOfAny(additions[i].parsed.path, seen)) {
        additions[i].selected = false;
      }
    } else if (!additions[i].selected) {
      seen.add(additions[i].parsed.path);
    }
  }

}

function selectDeletions(deletions){
  // if you select a folder, its contents and end must be selected
  // if you select a directory-end, the matching folder must be selected (and therefore the contents)

  // sweep up, selecting any contents and matching directories of selected directory-ends
  let seen = new Set();
  for (let i=deletions.length-1; i>=0; i--) {
    if (deletions[i].parsed.type !== "directory-end") {
      if (!deletions[i].selected && isChildOfAny(deletions[i].parsed.path, seen)) {
        deletions[i].selected = true;
      }
    } else if (deletions[i].selected) {
      seen.add(deletions[i].parsed.path);
    }
  }

  // sweep down, selecting any children/ends of selected directories 
  seen = new Set();
  for (let i=0; i<deletions.length; i++) {
    if (!deletions[i].selected && isChildOfAny(deletions[i].parsed.path, seen)) {
      deletions[i].selected = true;
    } else if (deletions[i].selected) {
      seen.add(deletions[i].parsed.path);
    }
  }
 
}

function deselectDeletions(deletions){
  // if you unselect a folder, its matching end must be unselected.
  // if you unselect an end, its matching folder must be unselected.
  // if you unselect a file or folder, all its parents and matching directory-ends must be unselected.

  // sweep up, deselecting any folders that are parents of deselected files/folders/ends
  let seen = new Set();
  for (let i=deletions.length-1; i>=0; i--) {
    if (deletions[i].parsed.type === "directory" && deletions[i].selected && isParentOfAny(deletions[i].parsed.path, seen)) {
      deletions[i].selected = false;      
    } else if (!deletions[i].selected) {
      seen.add(deletions[i].parsed.path);
    }
  }

  // sweep down, deselecting any directory-ends that match deselected folders 
  seen = new Set();
  for (let i=0; i<deletions.length; i++) {
    if (deletions[i].parsed.type === "directory-end") {
      if (deletions[i].selected && seen.has(deletions[i].parsed.path)) {
        deletions[i].selected = false;
      }
    } else if (deletions[i].parsed.type === "directory" && !deletions[i].selected) {
      seen.add(deletions[i].parsed.path);
    }
  }
}


module.exports = {
  selectAdditions: selectAdditions,
  deselectAdditions: deselectAdditions,
  selectDeletions: selectDeletions,
  deselectDeletions: deselectDeletions
}