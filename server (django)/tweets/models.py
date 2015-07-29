from django.db import models
from django.utils import timezone
import tweepy
import pytz


class Author(models.Model):
    screen_name = models.CharField(primary_key=True, max_length=50)
    name = models.CharField(max_length=50)
    profile_image_url = models.URLField()

    def __str__(self):
        return self.screen_name


class Tweet(models.Model):
    id = models.BigIntegerField(primary_key=True)
    created_at = models.DateTimeField()
    favorite_count = models.IntegerField()
    retweet_count = models.IntegerField()
    text = models.CharField(max_length=255, default='')
    author = models.ForeignKey(Author, db_column='author_screen_name')
    retweet_authors = models.ManyToManyField(Author, related_name='retweet_authors')
    # original_tweet = models.ForeignKey('self')
    # entities (?)
    # commands
    # preview_image_url

    def __str__(self):
        return self.text


# TODO: move to a config file somewhere
consumer_secret = '4GqRwgTxdH744MMAC1lIcksqAP6bbrZ9QHgAJfWH3e9Uue5Clf'
consumer_key = '3gPH91dVKQyPIviaSmi6Jy5TK'
auth = tweepy.OAuthHandler(consumer_key, consumer_secret)
api = tweepy.API(auth)


def create_tweet(tweet_id):
    try:
        Tweet.objects.get(pk=tweet_id)
        print('Tweet already exists...')
    except Tweet.DoesNotExist:
        try:
            retrieved_tweet = api.get_status(tweet_id)
            retweets = retrieved_tweet.retweets()
        except:
            # handle API query limitations here
            print('Error')
            return

        created_at_tz = pytz.timezone(timezone.get_current_timezone_name()).localize(retrieved_tweet.created_at)
        tweet = Tweet(
            id=retrieved_tweet.id,
            created_at=created_at_tz,
            favorite_count=retrieved_tweet.favorite_count,
            retweet_count=retrieved_tweet.retweet_count,
            text=retrieved_tweet.text
        )
        author_screen_name = retrieved_tweet.author.screen_name

        try:
            author = Author.objects.get(pk=author_screen_name)
        except Author.DoesNotExist:
            author = Author(
                screen_name=retrieved_tweet.author.screen_name,
                name=retrieved_tweet.author.name,
                profile_image_url=retrieved_tweet.author.profile_image_url
            )
            author.save()

        tweet.author = author
        tweet.save()

        for rt in retweets:
            try:
                rt_author = Author.objects.get(pk=rt.author.screen_name)
            except Author.DoesNotExist:
                rt_author = Author(
                    screen_name=rt.author.screen_name,
                    name=rt.author.name,
                    profile_image_url=rt.author.profile_image_url
                )
                rt_author.save()
            tweet.retweet_authors.add(rt_author);

        tweet.save()