const recombee = require('recombee-api-client')
const { BadRequestError } = require('./errors')
var rqs = recombee.requests

// eslint-disable-next-line no-undef
var client = new recombee.ApiClient('vieritage-dev', process.env.RECOMBEE_DATABASE_TOKEN, { region: 'ap-se' })

const addRecomShort = async (itemId, data, max = 0) => {
  if (max >= 3) {
    return
  }
  const requests = [
    new rqs.AddItem(itemId),
    new rqs.AddItemProperty('checked', 'boolean'),
    new rqs.AddItemProperty('duration', 'int'),
    new rqs.AddItemProperty('description', 'string'),
    new rqs.AddItemProperty('genres', 'set'),
    new rqs.AddItemProperty('type', 'string'),
    new rqs.AddItemProperty('isRefused', 'boolean'),
    new rqs.SetItemValues(
      itemId,
      {
        checked: false,
        duration: data.duration,
        description: data.description,
        genres: data.genres.map((item) => item.name),
        type: 'short',
      },
      {
        // optional parameters:
        cascadeCreate: true,
      }
    ),
  ]
  await client.send(new rqs.Batch(requests), (e) => {
    console.log(e)
    if (e?.code === 'ERR_SOCKET_CONNECTION_TIMEOUT' && max < 3) {
      addRecomShort(itemId, data, max + 1)
    }
  })
}

const updateRecomShort = async (itemId, data, max = 0) => {
  if (max >= 3) {
    return
  }

  const requests = [
    new rqs.SetItemValues(
      itemId,
      {
        checked: data.checked ?? false,
        duration: data.duration,
        description: data.description,
        genres: data.genres.map((item) => item.name),
        type: 'short',
      },
      {
        // optional parameters:
        cascadeCreate: true,
      }
    ),
  ]
  await client.send(new rqs.Batch(requests), (e) => {
    console.log(e)
    if (e?.code === 'ERR_SOCKET_CONNECTION_TIMEOUT' && max < 3) {
      updateRecomShort(itemId, data, max + 1)
    }
  })
}

const deleteRecom = async (itemId, max = 0) => {
  if (max >= 3) {
    return
  }
  await client.send(new rqs.DeleteItem(itemId), (e) => {
    console.log(e)
    if (e?.code === 'ERR_SOCKET_CONNECTION_TIMEOUT' && max < 3) {
      deleteRecom(itemId, max + 1)
    }
  })
}

const addRecomPost = async (itemId, data, max = 0) => {
  if (max >= 3) {
    return
  }
  const requests = [
    new rqs.AddItem(itemId),
    new rqs.AddItemProperty('checked', 'boolean'),
    new rqs.AddItemProperty('content', 'string'),
    new rqs.AddItemProperty('description', 'string'),
    new rqs.AddItemProperty('genres', 'set'),
    new rqs.AddItemProperty('type', 'string'),
    new rqs.AddItemProperty('isRefused', 'boolean'),
    new rqs.SetItemValues(
      itemId,
      {
        checked: false,
        description: data.description,
        content: data.content,
        genres: data.genres.map((item) => item.name),
        type: 'post',
      },
      {
        // optional parameters:
        cascadeCreate: true,
      }
    ),
  ]
  await client.send(new rqs.Batch(requests), (e) => {
    console.log(e)
    if (e?.code === 'ERR_SOCKET_CONNECTION_TIMEOUT' && max < 3) {
      addRecomPost(itemId, data, max + 1)
    }
  })
}

const updateRecomPost = async (itemId, data, max = 0) => {
  if (max >= 3) {
    return
  }
  const requests = [
    new rqs.SetItemValues(
      itemId,
      {
        checked: data.checked ?? false,
        description: data.description,
        content: data.content,
        genres: data.genres.map((item) => item.name),
        type: 'post',
      },
      {
        // optional parameters:
        cascadeCreate: true,
      }
    ),
  ]
  await client.send(new rqs.Batch(requests), (e) => {
    console.log(e)
    if (e?.code === 'ERR_SOCKET_CONNECTION_TIMEOUT' && max < 3) {
      updateRecomPost(itemId, data, max + 1)
    }
  })
}

const addRecomUser = async (itemId, max = 0) => {
  if (max >= 3) {
    return
  }
  await client.send(new rqs.AddUser(itemId), (e) => {
    console.log(e)
    if (e?.code === 'ERR_SOCKET_CONNECTION_TIMEOUT' && max < 3) {
      addRecomPost(itemId, max + 1)
    }
  })
}

const deleteRecomUser = async (itemId, max = 0) => {
  if (max >= 3) {
    return
  }
  await client.send(new rqs.DeleteUser(itemId), (e) => {
    console.log(e)
    if (e?.code === 'ERR_SOCKET_CONNECTION_TIMEOUT' && max < 3) {
      addRecomPost(itemId, max + 1)
    }
  })
}

const addRecomRating = async (userId, itemId, type, recommId = undefined, max = 0) => {
  if (max >= 3) {
    return
  }
  let value
  if (type === 'upvote') value = 1
  else value = -1

  const rqsOptions = {
    cascadeCreate: true,
  }
  if (!recommId) {
    rqsOptions.recommId = recommId
  }

  const requests = [new rqs.DeleteRating(userId, itemId), new rqs.AddRating(userId, itemId, value, rqsOptions)]

  await client.send(new rqs.Batch(requests), (e) => {
    console.log(e)
    if (e?.code === 'ERR_SOCKET_CONNECTION_TIMEOUT' && max < 3) {
      addRecomRating(userId, itemId, type, recommId, max + 1)
    }
  })
}

const deleteRecomRating = async (userId, itemId, max = 0) => {
  if (max >= 3) {
    return
  }

  await client.send(new rqs.DeleteRating(userId, itemId), (e) => {
    console.log(e)
    if (e?.code === 'ERR_SOCKET_CONNECTION_TIMEOUT' && max < 3) {
      deleteRecomRating(userId, itemId, max + 1)
    }
  })
}

const setRecomViewPortion = async (userId, itemId, portion, recommId = undefined, max = 0) => {
  if (max >= 3) {
    return
  }

  const rqsOptions = {
    cascadeCreate: true,
  }
  if (!recommId) {
    rqsOptions.recommId = recommId
  }

  await client.send(new rqs.SetViewPortion(userId, itemId, portion, rqsOptions), (e) => {
    console.log(e)
    if (e?.code === 'ERR_SOCKET_CONNECTION_TIMEOUT' && max < 3) {
      deleteRecomRating(userId, itemId, max + 1)
    }
  })
}

const getRecom = async (userId, type, max = 0) => {
  let scenario
  switch (type) {
    case 'verified-post':
      scenario = 'young-user'
      break
    case 'verified-short':
      scenario = 'young-user-short'
      break
    case 'unverified-short':
      scenario = 'aged-user-short'
      break
    case 'unverified-post':
      scenario = 'aged-user'
      break
    default:
      throw new BadRequestError('Wrong filter value')
  }

  if (max >= 3) {
    return
  }

  return client.send(
    new rqs.RecommendItemsToUser(
      userId,
      5,
      {
        scenario,
      }
      // , {
      // scenario,
      // cascadeCreate: true,
      // filter,
      // }
    )
  )
}

const verify = async (itemId, max = 0) => {
  if (max >= 3) {
    return
  }

  const requests = [
    new rqs.SetItemValues(
      itemId,
      {
        checked: true,
      },
      {
        // optional parameters:
        cascadeCreate: true,
      }
    ),
  ]
  await client.send(new rqs.Batch(requests), (e) => {
    console.log(e)
    if (e?.code === 'ERR_SOCKET_CONNECTION_TIMEOUT' && max < 3) {
      verify(itemId, max + 1)
    }
  })
}

const refuse = async (itemId, max = 0) => {
  if (max >= 3) {
    return
  }

  const requests = [
    new rqs.SetItemValues(
      itemId,
      {
        isRefused: true,
      },
      {
        // optional parameters:
        cascadeCreate: true,
      }
    ),
  ]
  await client.send(new rqs.Batch(requests), (e) => {
    console.log(e)
    if (e?.code === 'ERR_SOCKET_CONNECTION_TIMEOUT' && max < 3) {
      refuse(itemId, max + 1)
    }
  })
}

module.exports = {
  client,
  rqs,
  addRecomShort,
  addRecomPost,
  updateRecomShort,
  deleteRecom,
  updateRecomPost,
  addRecomUser,
  deleteRecomUser,
  addRecomRating,
  deleteRecomRating,
  setRecomViewPortion,
  getRecom,
  verify,
  refuse,
}
