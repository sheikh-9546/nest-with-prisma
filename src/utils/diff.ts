export function diff(before: any, after: any): object {
    const changes = {};
    
    // Loop over the keys in the "after" object
    for (const key in after) {
      // Compare with the "before" object
      if (before[key] !== after[key]) {
        changes[key] = { old: before[key], new: after[key] };
      }
    }
    
    return changes;
  }
  