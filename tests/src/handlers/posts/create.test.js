import * as handler from '../../../../src/handlers/posts/create';

test('test bad request with empty body', async () => {
  const event = 'event';

  let result;

  try {
    result = await handler.main(event);
  } catch (error) {
    result = error;
  }

  expect(result.statusCode).toEqual(400);
  expect(typeof result.body).toBe('string');
  const expected = {
    "errors": [
      {
        "detail": "Request body is empty or invalid json",
        "status": "400",
        "title": "BadRequest",
      }
    ]
  };

  expect(JSON.parse(result.body)).toEqual(expected);
});
