/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// https://github.com/microsoft/vscode/blob/master/extensions/git/src/api/git.d.ts
// https://github.com/microsoft/vscode/blob/master/extensions/git/README.md

import { Uri, SourceControlInputBox, Event, CancellationToken } from "vscode";

export interface Git {
  readonly path: string;
}

export interface InputBox {
  value: string;
}

export const enum RefType {
  Head,
  RemoteHead,
  Tag,
}

export interface Ref {
  readonly type: RefType;
  readonly name?: string;
  readonly commit?: string;
  readonly remote?: string;
}

export interface UpstreamRef {
  readonly remote: string;
  readonly name: string;
}

export interface Branch extends Ref {
  readonly upstream?: UpstreamRef;
  readonly ahead?: number;
  readonly behind?: number;
}

export interface Commit {
  readonly hash: string;
  readonly message: string;
  readonly parents: string[];
  readonly authorEmail?: string | undefined;
}

export interface Submodule {
  readonly name: string;
  readonly path: string;
  readonly url: string;
}

export interface Remote {
  readonly name: string;
  readonly fetchUrl?: string;
  readonly pushUrl?: string;
  readonly isReadOnly: boolean;
}

export const enum Status {
  INDEX_MODIFIED,
  INDEX_ADDED,
  INDEX_DELETED,
  INDEX_RENAMED,
  INDEX_COPIED,

  MODIFIED,
  DELETED,
  UNTRACKED,
  IGNORED,
  INTENT_TO_ADD,

  ADDED_BY_US,
  ADDED_BY_THEM,
  DELETED_BY_US,
  DELETED_BY_THEM,
  BOTH_ADDED,
  BOTH_DELETED,
  BOTH_MODIFIED,
}

export interface Change {
  /**
   * Returns either `originalUri` or `renameUri`, depending
   * on whether this change is a rename change. When
   * in doubt always use `uri` over the other two alternatives.
   */
  readonly uri: Uri;
  readonly originalUri: Uri;
  readonly renameUri: Uri | undefined;
  readonly status: Status;
}

export interface RepositoryState {
  readonly HEAD: Branch | undefined;
  readonly refs: Ref[];
  readonly remotes: Remote[];
  readonly submodules: Submodule[];
  readonly rebaseCommit: Commit | undefined;

  readonly mergeChanges: Change[];
  readonly indexChanges: Change[];
  readonly workingTreeChanges: Change[];

  readonly onDidChange: Event<void>;
}

export interface RepositoryUIState {
  readonly selected: boolean;
  readonly onDidChange: Event<void>;
}

/**
 * Log options.
 */
export interface LogOptions {
  /** Max number of log entries to retrieve. If not specified, the default is 32. */
  readonly maxEntries?: number;
}

export interface Repository {
  readonly rootUri: Uri;
  readonly inputBox: InputBox;
  readonly state: RepositoryState;
  readonly ui: RepositoryUIState;

  getConfigs(): Promise<{ key: string; value: string }[]>;
  getConfig(key: string): Promise<string>;
  setConfig(key: string, value: string): Promise<string>;
  getGlobalConfig(key: string): Promise<string>;

  getObjectDetails(treeish: string, path: string): Promise<{ mode: string; object: string; size: number }>;
  detectObjectType(object: string): Promise<{ mimetype: string; encoding?: string }>;
  buffer(ref: string, path: string): Promise<Buffer>;
  show(ref: string, path: string): Promise<string>;
  getCommit(ref: string): Promise<Commit>;

  clean(paths: string[]): Promise<void>;

  apply(patch: string, reverse?: boolean): Promise<void>;
  diff(cached?: boolean): Promise<string>;
  diffWithHEAD(): Promise<Change[]>;
  diffWithHEAD(path: string): Promise<string>;
  diffWith(ref: string): Promise<Change[]>;
  diffWith(ref: string, path: string): Promise<string>;
  diffIndexWithHEAD(): Promise<Change[]>;
  diffIndexWithHEAD(path: string): Promise<string>;
  diffIndexWith(ref: string): Promise<Change[]>;
  diffIndexWith(ref: string, path: string): Promise<string>;
  diffBlobs(object1: string, object2: string): Promise<string>;
  diffBetween(ref1: string, ref2: string): Promise<Change[]>;
  diffBetween(ref1: string, ref2: string, path: string): Promise<string>;

  hashObject(data: string): Promise<string>;

  createBranch(name: string, checkout: boolean, ref?: string): Promise<void>;
  deleteBranch(name: string, force?: boolean): Promise<void>;
  getBranch(name: string): Promise<Branch>;
  setBranchUpstream(name: string, upstream: string): Promise<void>;

  getMergeBase(ref1: string, ref2: string): Promise<string>;

  status(): Promise<void>;
  checkout(treeish: string): Promise<void>;

  addRemote(name: string, url: string): Promise<void>;
  removeRemote(name: string): Promise<void>;

  fetch(remote?: string, ref?: string, depth?: number): Promise<void>;
  pull(unshallow?: boolean): Promise<void>;
  push(remoteName?: string, branchName?: string, setUpstream?: boolean): Promise<void>;

  blame(path: string): Promise<string>;
  log(options?: LogOptions): Promise<Commit[]>;
}

export type APIState = "uninitialized" | "initialized";

export interface API {
  readonly state: APIState;
  readonly onDidChangeState: Event<APIState>;
  readonly git: Git;
  readonly repositories: Repository[];
  readonly onDidOpenRepository: Event<Repository>;
  readonly onDidCloseRepository: Event<Repository>;
}

export interface GitExtension {
  readonly enabled: boolean;
  readonly onDidChangeEnablement: Event<boolean>;

  /**
   * Returns a specific API version.
   *
   * Throws error if git extension is disabled. You can listed to the
   * [GitExtension.onDidChangeEnablement](#GitExtension.onDidChangeEnablement) event
   * to know when the extension becomes enabled/disabled.
   *
   * @param version Version number.
   * @returns API instance
   */
  getAPI(version: 1): API;
}

export const enum GitErrorCodes {
  BadConfigFile = "BadConfigFile",
  AuthenticationFailed = "AuthenticationFailed",
  NoUserNameConfigured = "NoUserNameConfigured",
  NoUserEmailConfigured = "NoUserEmailConfigured",
  NoRemoteRepositorySpecified = "NoRemoteRepositorySpecified",
  NotAGitRepository = "NotAGitRepository",
  NotAtRepositoryRoot = "NotAtRepositoryRoot",
  Conflict = "Conflict",
  StashConflict = "StashConflict",
  UnmergedChanges = "UnmergedChanges",
  PushRejected = "PushRejected",
  RemoteConnectionError = "RemoteConnectionError",
  DirtyWorkTree = "DirtyWorkTree",
  CantOpenResource = "CantOpenResource",
  GitNotFound = "GitNotFound",
  CantCreatePipe = "CantCreatePipe",
  CantAccessRemote = "CantAccessRemote",
  RepositoryNotFound = "RepositoryNotFound",
  RepositoryIsLocked = "RepositoryIsLocked",
  BranchNotFullyMerged = "BranchNotFullyMerged",
  NoRemoteReference = "NoRemoteReference",
  InvalidBranchName = "InvalidBranchName",
  BranchAlreadyExists = "BranchAlreadyExists",
  NoLocalChanges = "NoLocalChanges",
  NoStashFound = "NoStashFound",
  LocalChangesOverwritten = "LocalChangesOverwritten",
  NoUpstreamBranch = "NoUpstreamBranch",
  IsInSubmodule = "IsInSubmodule",
  WrongCase = "WrongCase",
  CantLockRef = "CantLockRef",
  CantRebaseMultipleBranches = "CantRebaseMultipleBranches",
  PatchDoesNotApply = "PatchDoesNotApply",
  NoPathFound = "NoPathFound",
  UnknownPath = "UnknownPath",
}
