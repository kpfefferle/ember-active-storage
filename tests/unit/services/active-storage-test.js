import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { get } from '@ember/object';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import fetchFile from 'dummy/tests/helpers/fetch-file';

module('Unit | Service | active-storage', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  let service, file;

  hooks.beforeEach(async function() {
    service = this.owner.lookup('service:active-storage');
    file = await fetchFile('/sample.pdf');
  });

  test('upload() returns blob model', async function(assert) {
    let blob = await service.upload(file, '/api/attachments/upload');
    assert.equal(get(blob, 'name'), 'sample.pdf');
    assert.equal(get(blob, 'type'), 'application/pdf');
    assert.equal(get(blob, 'size'), 6081);
    assert.equal(get(blob, 'id'), 123);
    assert.ok(get(blob, 'signedId'));
    assert.ok(get(blob, 'key'));
    assert.equal(get(blob, 'directUploadData.url'), '/api/attachments/direct-upload');
    assert.equal(get(blob, 'directUploadData.headers')['Content-Type'], 'application/pdf');
  });

  test('upload() invokes onProgress callback', async function(assert) {
    let n = 0;
    await service.upload(file, '/api/attachments/upload', {
      onProgress(progress) {
        n++;
        assert.ok(progress > 0);
        assert.ok(progress <= 100);
      }
    });
    assert.ok(n > 0);
  });

});
