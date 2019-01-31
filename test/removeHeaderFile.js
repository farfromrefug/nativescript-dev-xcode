/**
 Licensed to the Apache Software Foundation (ASF) under one
 or more contributor license agreements.  See the NOTICE file
 distributed with this work for additional information
 regarding copyright ownership.  The ASF licenses this file
 to you under the Apache License, Version 2.0 (the
 'License'); you may not use this file except in compliance
 with the License.  You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing,
 software distributed under the License is distributed on an
 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 KIND, either express or implied.  See the License for the
 specific language governing permissions and limitations
 under the License.
 */

var fullProject = require('./fixtures/full-project')
    fullProjectStr = JSON.stringify(fullProject),
    pbx = require('../lib/pbxProject'),
    pbxFile = require('../lib/pbxFile').pbxFile,
    proj = new pbx('.');

function cleanHash() {
    return JSON.parse(fullProjectStr);
}

exports.setUp = function (callback) {
    proj.hash = cleanHash();
    callback();
}

exports.removeHeaderFile = {
    'should return a pbxFile': function (test) {
        var newFile = proj.addHeaderFile('file.h');

        test.equal(newFile.constructor, pbxFile);

        var deletedFile = proj.removeHeaderFile('file.h');

        test.equal(deletedFile.constructor, pbxFile);

        test.done()
    },
    'should set a fileRef on the pbxFile': function (test) {
        var newFile = proj.addHeaderFile('file.h');

        test.ok(newFile.fileRef);

        var deletedFile = proj.removeHeaderFile('file.h');

        test.ok(deletedFile.fileRef);

        test.done()
    },
    'should remove 2 fields from the PBXFileReference section': function (test) {
        var newFile = proj.addHeaderFile('file.h'),
            fileRefSection = proj.pbxFileReferenceSection(),
            frsLength = Object.keys(fileRefSection).length;

        test.equal(68, frsLength);
        test.ok(fileRefSection[newFile.fileRef]);
        test.ok(fileRefSection[newFile.fileRef + '_comment']);

        var deletedFile = proj.removeHeaderFile('file.h'),
            fileRefSection = proj.pbxFileReferenceSection(),
            frsLength = Object.keys(fileRefSection).length;

        test.equal(66, frsLength);
        test.ok(!fileRefSection[deletedFile.fileRef]);
        test.ok(!fileRefSection[deletedFile.fileRef + '_comment']);

        test.done();
    },
    'should remove comment from the PBXFileReference correctly': function (test) {
        var newFile = proj.addHeaderFile('file.h'),
            fileRefSection = proj.pbxFileReferenceSection(),
            commentKey = newFile.fileRef + '_comment';

        test.equal(fileRefSection[commentKey], 'file.h');

        var deletedFile = proj.removeHeaderFile('file.h'),
            fileRefSection = proj.pbxFileReferenceSection(),
            commentKey = deletedFile.fileRef + '_comment';
        test.ok(!fileRefSection[commentKey]);

        test.done();
    },
    'should remove the PBXFileReference object correctly': function (test) {
        var newFile = proj.addHeaderFile('Plugins/file.h'),
            fileRefSection = proj.pbxFileReferenceSection(),
            fileRefEntry = fileRefSection[newFile.fileRef];

        test.equal(fileRefEntry.isa, 'PBXFileReference');
        test.equal(fileRefEntry.fileEncoding, 4);
        test.equal(fileRefEntry.lastKnownFileType, 'sourcecode.c.h');
        test.equal(fileRefEntry.name, 'file.h');
        test.equal(fileRefEntry.path, 'file.h');
        test.equal(fileRefEntry.sourceTree, '"<group>"');

        var deletedFile = proj.removeHeaderFile('Plugins/file.h'),
            fileRefSection = proj.pbxFileReferenceSection(),
            fileRefEntry = fileRefSection[deletedFile.fileRef];

        test.ok(!fileRefEntry);

        test.done();
    },
    'should remove from the Plugins PBXGroup group': function (test) {
        var newFile = proj.addHeaderFile('Plugins/file.h'),
            plugins = proj.pbxGroupByName('Plugins');

        test.equal(plugins.children.length, 1);

        var deletedFile = proj.removeHeaderFile('Plugins/file.h'),
            plugins = proj.pbxGroupByName('Plugins');

        test.equal(plugins.children.length, 0);

        test.done();
    }
}
