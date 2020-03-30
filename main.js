const GAME_STATE = {  //遊戲的五個狀態
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished",
}

const Symbols = [
  'https://image.flaticon.com/icons/svg/105/105223.svg', // 黑桃
  'https://image.flaticon.com/icons/svg/105/105220.svg', // 愛心
  'https://image.flaticon.com/icons/svg/105/105212.svg', // 方塊
  'https://image.flaticon.com/icons/svg/105/105219.svg' // 梅花
]

const view = {
  //JQKA的轉換
  transformNumber(number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },

  getCardContent(index) {
    const number = this.transformNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]
    return `    
      <p>${number}</p>
      <img src="${symbol}">
      <p>${number}</p>
      `

  },
  getCardElement(index) {
    return `    
    <div data-index="${index}" class="card back">
    </div>`
  },

  displayCards(indexes) {
    const rootElement = document.querySelector('#cards')
    rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join('')  //[0~51]
  },

  flipCard(card) {
    // 翻面，正->反
    if (card.classList.contains('back')) {
      card.classList.remove('back')
      card.innerHTML = this.getCardContent(Number(card.dataset.index))
      return
    }
    //else 反->正 或說原本flipCard就是要翻成背面，只是因為預設為背面，所以會跑if
    card.classList.add('back')
    card.innerHTML = null
  },

  pairCard(card) { //已配對，給予css樣式paired
    card.classList.add('paired')
  }
}

const utility = {
  getRandomNumberArray(count) {
    // count = 5 => [2,3,4,1,0]
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1));
      // const temp = number[index]
      // number[index] = number[radomIndex]
      // number[radomIndex] = temp  
      [number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}

const model ={ //集中管理資料
  revealedCards: [],

  isRevealedCardsMatcher(){ //資料配對成功
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  },
}

const controller = { //推進遊戲狀態
  currentState: GAME_STATE.FirstCardAwaits,  //起始狀態
  generateCards(){
    view.displayCards(utility.getRandomNumberArray(52))
  },
  //依照遊戲狀態做出不同行為
  dispatchCardAction(card){
    if (!card.classList.contains('back')){ //不理已翻開的牌
      return
    }
    switch(this.currentState){
      case GAME_STATE.FirstCardAwaits:
        view.flipCard(card)  //翻開第一張牌
        model.revealedCards.push(card) //存到暫存
        this.currentState = GAME_STATE.SecondCardAwaits //改變狀態
        break
      
      case GAME_STATE.SecondCardAwaits:
        view.flipCard(card) //翻開第二張牌
        model.revealedCards.push(card) //存到暫存
        //檢查翻開的兩張牌大小是否相同
        console.log(model.isRevealedCardsMatcher())
        if (model.isRevealedCardsMatcher()) {
          //牌面相同
          this.currentState = GAME_STATE.CardsMatched //配對成功狀態
          view.pairCard(model.revealedCards[0])
          view.pairCard(model.revealedCards[1])
          model.revealedCards = [] //清空暫存區
          this.currentState = GAME_STATE.FirstCardAwaits //回到起始狀態
        } else {
          //牌面不相同
          this.currentState = GAME_STATE.CardsMatchFailed //配對失敗狀態
          setTimeout(() => { //停留1秒記憶
            view.flipCard(model.revealedCards[0]) //翻回背面
            view.flipCard(model.revealedCards[1])
            model.revealedCards = [] //清空暫存區
            this.currentState = GAME_STATE.FirstCardAwaits //回到起始狀態
          }, 1000);
        }
        break
    }
        console.log(this.currentState)
  },

}

controller.generateCards()

//Node List (array-like)
//為每一個 .card 產生監聽器，總共需要 52 個監聽器
//使用 forEach 來迭代陣列，為每張卡牌加上事件監聽器
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', e => {
    controller.dispatchCardAction(card)
    console.log(card)

  })
})