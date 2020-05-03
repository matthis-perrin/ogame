import $ from 'jquery';

const url = 'http://localhost:3000';

export async function getItem(key: string): Promise<string> {
  return $.get({url: `${url}/${key}`, method: 'GET'})
    .promise()
    .then(json => JSON.parse(json).data);
}

export async function setItem(key: string, data: string): Promise<string> {
  return $.get({url: `${url}/${key}`, method: 'POST', data}).promise();
}
